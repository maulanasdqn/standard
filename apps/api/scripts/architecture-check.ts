import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import { edgeViolation } from "./architecture-edge-violation.ts";
import {
	isModuleSurface,
	LAYERS,
	PLACE_KIND,
	placeOf,
	type TPlace,
} from "./architecture-places.ts";
import { MODULE_SURFACE } from "./architecture-rules.ts";
import {
	resolveSpecifier,
	specifiersOf,
	TARGET_KIND,
	uncheckedSpecifiersOf,
} from "./architecture-specifiers.ts";
import {
	RULE,
	type TViolation,
	type TViolationSite,
} from "./architecture-violation.ts";

export { RULE, type TViolation } from "./architecture-violation.ts";

const FIRST_LINE = 1;

const rootOf = (file: string): string => file.split("/")[0] ?? file;

const unclassifiedViolation = (
	from: TPlace,
	file: string,
): TViolation | undefined =>
	match(from)
		.with(
			{ kind: PLACE_KIND.UNKNOWN },
			(found): TViolation => ({
				file,
				line: FIRST_LINE,
				rule: RULE.UNCLASSIFIED_PATH,
				edge: found.name,
				specifier: file,
				remedy: `add "${found.name}" to MODULE or AREA in scripts/architecture-rules.ts, or move the file`,
			}),
		)
		.otherwise((): undefined => undefined);

const surfaceViolation = (from: TPlace, file: string): TViolation | undefined =>
	match(from)
		.with(
			{ kind: PLACE_KIND.MODULE, layer: null },
			(found): TViolation | undefined =>
				isModuleSurface(file)
					? undefined
					: {
							file,
							line: FIRST_LINE,
							rule: RULE.MODULE_LAYER,
							edge: found.module,
							specifier: file,
							remedy: `every file in "${found.module}" belongs to one of ${A.join(LAYERS, ", ")}; only "${found.module}/${MODULE_SURFACE}" may sit at the module root`,
						},
		)
		.otherwise((): undefined => undefined);

const escapeViolation = (file: string, site: TViolationSite): TViolation => ({
	...site,
	rule: RULE.PATH_ESCAPE,
	edge: rootOf(file),
	remedy: `the specifier resolves outside the file's own directory; use an absolute "#/" specifier so the boundary is checkable`,
});

const uncheckedViolation = (
	file: string,
	site: TViolationSite,
): TViolation => ({
	...site,
	rule: RULE.UNCHECKED_SPECIFIER,
	edge: rootOf(file),
	remedy:
		"a dynamic import or require needs a string literal specifier so the boundary is checkable",
});

export const violationsFor = (
	file: string,
	source: string,
): readonly TViolation[] => {
	const from = placeOf(file);

	const edges = A.filterMap(specifiersOf(source), ({ line, specifier }) => {
		const site: TViolationSite = { file, line, specifier };

		return match(resolveSpecifier(file, specifier))
			.with({ kind: TARGET_KIND.PACKAGE }, (): undefined => undefined)
			.with(
				{ kind: TARGET_KIND.ESCAPE },
				(): TViolation => escapeViolation(file, site),
			)
			.with({ kind: TARGET_KIND.INSIDE }, ({ path }): TViolation | undefined =>
				edgeViolation(from, path, file, site),
			)
			.exhaustive();
	});

	const unchecked = A.map(
		uncheckedSpecifiersOf(source),
		({ line, specifier }) =>
			uncheckedViolation(file, { file, line, specifier }),
	);

	return A.filterMap(
		[
			unclassifiedViolation(from, file),
			surfaceViolation(from, file),
			...edges,
			...unchecked,
		],
		(violation) => violation,
	);
};
