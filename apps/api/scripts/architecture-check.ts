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

export type TViolation = {
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

const SPECIFIER_PATTERNS: readonly RegExp[] = [
	/\bfrom\s*["']#\/([^"']+)["']/g,
	/\bimport\s*\(\s*["']#\/([^"']+)["']/g,
	/\bimport\s+["']#\/([^"']+)["']/g,
	/\brequire\s*\(\s*["']#\/([^"']+)["']/g,
];

export type TImportSite = { line: number; target: string };

export const importsOf = (source: string): readonly TImportSite[] =>
	A.flat(
		A.mapWithIndex(source.split("\n"), (index, line) =>
			A.flat(
				A.map(SPECIFIER_PATTERNS, (pattern) =>
					A.filterMap([...line.matchAll(new RegExp(pattern))], (m) =>
						m[1] === undefined ? undefined : { line: index + 1, target: m[1] },
					),
				),
			),
		),
	);

export const placeOf = (path: string): TPlace => {
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
	match({ from: from.name, toModule: to.kind === "module" })
		.with({ from: AREA.SHARED }, () => to.name !== AREA.SHARED)
		.with(
			{ from: AREA.PLATFORM, toModule: true },
			() => !A.includes(COMPOSITION_ROOT, file),
		)
		.otherwise(() => false);

export const violationsFor = (
	file: string,
	source: string,
): readonly TViolation[] => {
	const from = placeOf(file);

	const unknown: readonly TViolation[] =
		from.kind === "unknown"
			? [
					{
						file,
						line: 1,
						rule: "unclassified-path",
						edge: from.name,
						specifier: file,
						remedy: `add "${from.name}" to MODULE or AREA in scripts/architecture-rules.ts, or move the file`,
					},
				]
			: [];

	const edges = A.filterMap(importsOf(source), ({ line, target }) => {
		const to = placeOf(target);
		const base = { file, line, specifier: `#/${target}` };

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
				() => areaViolation(from, to, file),
				(): TViolation => ({
					...base,
					rule: "area-boundary",
					edge: `${from.name} -> ${to.name}`,
					remedy: `${from.name} may not depend on ${to.name}`,
				}),
			)
			.otherwise(() => undefined);
	});

	const escapes = A.filterMap(source.split("\n"), (line, index) =>
		line.includes('from "../') || line.includes("from '../")
			? {
					file,
					line: index + 1,
					rule: "relative-escape",
					edge: file.split("/")[0] ?? file,
					specifier: line.trim(),
					remedy: 'use an absolute "#/" specifier so the boundary is checkable',
				}
			: undefined,
	);

	return [...unknown, ...edges, ...escapes];
};
