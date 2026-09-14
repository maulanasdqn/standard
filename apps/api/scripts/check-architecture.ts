import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { A, D } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import {
	AREA,
	COMPOSITION_ROOT,
	ENTRYPOINT,
	LAYER,
	LAYER_MAY_IMPORT,
	MODULE,
	MODULE_MAY_IMPORT,
	MODULE_SURFACE,
	type TLayer,
	type TModule,
} from "./architecture-rules.ts";

const SRC = new URL("../src", import.meta.url).pathname;
const IMPORT_PATTERN = /from\s+"#\/([^"]+)"/g;
const EXIT_FAILURE = 1;

type TViolation = {
	file: string;
	line: number;
	rule: string;
	edge: string;
	specifier: string;
	remedy: string;
};

type TPlace = {
	kind: "module" | "area" | "entrypoint" | "unknown";
	name: string;
	layer: TLayer | null;
};

const MODULES: readonly string[] = D.values(MODULE);
const AREAS: readonly string[] = D.values(AREA);
const LAYERS: readonly string[] = D.values(LAYER);

const filesUnder = (dir: string): readonly string[] =>
	A.flat(
		A.map(readdirSync(dir), (entry) => {
			const full = join(dir, entry);
			return statSync(full).isDirectory()
				? filesUnder(full)
				: full.endsWith(".ts")
					? [full]
					: [];
		}),
	);

const placeOf = (path: string): TPlace => {
	const segments = path.split("/");
	const head = segments[0] ?? "";
	return match(head)
		.when(
			() => A.includes(ENTRYPOINT, path),
			(): TPlace => ({ kind: "entrypoint", name: path, layer: null }),
		)
		.when(
			(value) => A.includes(MODULES, value),
			(value): TPlace => ({
				kind: "module",
				name: value,
				layer: A.includes(LAYERS, segments[1] ?? "")
					? (segments[1] as TLayer)
					: null,
			}),
		)
		.when(
			(value) => A.includes(AREAS, value),
			(value): TPlace => ({ kind: "area", name: value, layer: null }),
		)
		.otherwise(
			(value): TPlace => ({ kind: "unknown", name: value, layer: null }),
		);
};

const layerViolation = (from: TPlace, to: TPlace): boolean =>
	from.kind === "module" &&
	to.kind === "module" &&
	from.name === to.name &&
	from.layer !== null &&
	to.layer !== null &&
	!A.includes(LAYER_MAY_IMPORT[from.layer], to.layer);

const moduleViolation = (from: TPlace, to: TPlace, target: string): boolean =>
	from.kind === "module" &&
	to.kind === "module" &&
	from.name !== to.name &&
	(!A.includes(MODULE_MAY_IMPORT[from.name as TModule], to.name as TModule) ||
		target !== `${to.name}/${MODULE_SURFACE}`);

const areaViolation = (from: TPlace, to: TPlace, file: string): boolean =>
	match({ from: from.name, to: to.kind === "module" })
		.with({ from: AREA.SHARED }, () => to.name !== AREA.SHARED)
		.with(
			{ from: AREA.PLATFORM, to: true },
			() => !A.includes(COMPOSITION_ROOT, file),
		)
		.otherwise(() => false);

const checkFile = (file: string): readonly TViolation[] => {
	const rel = relative(SRC, file);
	const from = placeOf(rel);
	const lines = readFileSync(file, "utf8").split("\n");

	const unknown: readonly TViolation[] =
		from.kind === "unknown"
			? [
					{
						file: rel,
						line: 1,
						rule: "unclassified-path",
						edge: from.name,
						specifier: rel,
						remedy: `add "${from.name}" to MODULE or AREA in scripts/architecture-rules.ts, or move the file`,
					},
				]
			: [];

	const imports = A.flat(
		A.mapWithIndex(lines, (index, line) =>
			A.map([...line.matchAll(IMPORT_PATTERN)], (m) => ({
				line: index + 1,
				target: m[1] ?? "",
			})),
		),
	);

	const edges = A.filterMap(imports, ({ line, target }) => {
		const to = placeOf(target);
		const base = { file: rel, line, specifier: `#/${target}` };

		return match(true)
			.when(
				() => layerViolation(from, to),
				(): TViolation => ({
					...base,
					rule: "layer-boundary",
					edge: `${from.layer} -> ${to.layer}`,
					remedy: `${from.layer} may import ${A.join(LAYER_MAY_IMPORT[from.layer as TLayer], ", ")}. Move the dependency behind a port`,
				}),
			)
			.when(
				() => moduleViolation(from, to, target),
				(): TViolation => ({
					...base,
					rule: "module-isolation",
					edge: `${from.name} -> ${to.name}`,
					remedy: `cross-module access goes through "#/${to.name}/${MODULE_SURFACE}", and the edge must be listed in MODULE_MAY_IMPORT`,
				}),
			)
			.when(
				() => areaViolation(from, to, rel),
				(): TViolation => ({
					...base,
					rule: "area-boundary",
					edge: `${from.name} -> ${to.name}`,
					remedy: `${from.name} may not depend on ${to.name}`,
				}),
			)
			.otherwise(() => undefined);
	});

	return [...unknown, ...edges];
};

const relativeEscapes = (file: string): readonly TViolation[] => {
	const rel = relative(SRC, file);
	return A.filterMap(readFileSync(file, "utf8").split("\n"), (line, index) =>
		line.includes('from "../')
			? {
					file: rel,
					line: index + 1,
					rule: "relative-escape",
					edge: rel.split("/")[0] ?? rel,
					specifier: line.trim(),
					remedy: 'use an absolute "#/" specifier so the boundary is checkable',
				}
			: undefined,
	);
};

const report = (violations: readonly TViolation[]): void => {
	A.forEach(violations, (v) => {
		process.stdout.write(
			`${v.file}:${v.line}\n  ${v.rule}\t${v.edge}\n  import "${v.specifier}"\n  ${v.remedy}\n\n`,
		);
	});
	process.stdout.write(
		`${violations.length} violation${violations.length === 1 ? "" : "s"}\n`,
	);
};

const files = filesUnder(SRC);
const violations = A.flat(
	A.map(files, (file) => [...checkFile(file), ...relativeEscapes(file)]),
);

report(violations);

match(A.isEmpty(violations))
	.with(false, () => process.exit(EXIT_FAILURE))
	.otherwise(() => undefined);
