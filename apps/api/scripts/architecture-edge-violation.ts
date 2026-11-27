import { A } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";
import {
	nameOf,
	PLACE_KIND,
	placeOf,
	type TAreaPlace,
	type TPlace,
} from "./architecture-places.ts";
import {
	AREA,
	COMPOSITION_ROOT,
	LAYER_MAY_IMPORT,
	MODULE_MAY_IMPORT,
	MODULE_SURFACE,
} from "./architecture-rules.ts";
import {
	RULE,
	type TViolation,
	type TViolationSite,
} from "./architecture-violation.ts";

const targetViolation = (
	to: TPlace,
	site: TViolationSite,
): TViolation | undefined =>
	match(to)
		.with(
			{ kind: PLACE_KIND.UNKNOWN },
			(found): TViolation => ({
				...site,
				rule: RULE.UNCLASSIFIED_PATH,
				edge: found.name,
				remedy: `the import lands in "${found.name}", which is neither a module nor an area; fix the path or add it to scripts/architecture-rules.ts`,
			}),
		)
		.otherwise((): undefined => undefined);

const layerViolation = (
	from: TPlace,
	to: TPlace,
	site: TViolationSite,
): TViolation | undefined =>
	match({ from, to })
		.with(
			{
				from: { kind: PLACE_KIND.MODULE, layer: P.string },
				to: { kind: PLACE_KIND.MODULE, layer: P.string },
			},
			({ from: source, to: target }): TViolation | undefined =>
				source.module === target.module &&
				!A.includes(LAYER_MAY_IMPORT[source.layer], target.layer)
					? {
							...site,
							rule: RULE.LAYER_BOUNDARY,
							edge: `${source.layer} -> ${target.layer}`,
							remedy: `${source.layer} may import ${A.join(LAYER_MAY_IMPORT[source.layer], ", ")}. Move the dependency behind a port`,
						}
					: undefined,
		)
		.otherwise((): undefined => undefined);

const moduleViolation = (
	from: TPlace,
	to: TPlace,
	target: string,
	site: TViolationSite,
): TViolation | undefined =>
	match({ from, to })
		.with(
			{ from: { kind: PLACE_KIND.MODULE }, to: { kind: PLACE_KIND.MODULE } },
			({ from: source, to: destination }): TViolation | undefined =>
				source.module !== destination.module &&
				(!A.includes(MODULE_MAY_IMPORT[source.module], destination.module) ||
					target !== `${destination.module}/${MODULE_SURFACE}`)
					? {
							...site,
							rule: RULE.MODULE_ISOLATION,
							edge: `${source.module} -> ${destination.module}`,
							remedy: `cross-module access goes through "#/${destination.module}/${MODULE_SURFACE}", and the edge must be listed in MODULE_MAY_IMPORT`,
						}
					: undefined,
		)
		.otherwise((): undefined => undefined);

const areaCrossesBoundary = (
	from: TAreaPlace,
	to: TPlace,
	file: string,
): boolean =>
	match(from.area)
		.with(
			AREA.SHARED,
			(): boolean => !(to.kind === PLACE_KIND.AREA && to.area === AREA.SHARED),
		)
		.with(AREA.PLATFORM, (): boolean => to.kind === PLACE_KIND.MODULE)
		.with(
			AREA.BOOTSTRAP,
			(): boolean =>
				to.kind === PLACE_KIND.MODULE && !A.includes(COMPOSITION_ROOT, file),
		)
		.otherwise((): boolean => false);

const areaViolation = (
	from: TPlace,
	to: TPlace,
	file: string,
	site: TViolationSite,
): TViolation | undefined =>
	match(from)
		.with({ kind: PLACE_KIND.AREA }, (source): TViolation | undefined =>
			areaCrossesBoundary(source, to, file)
				? {
						...site,
						rule: RULE.AREA_BOUNDARY,
						edge: `${source.area} -> ${nameOf(to)}`,
						remedy: `${source.area} may not depend on ${nameOf(to)}`,
					}
				: undefined,
		)
		.otherwise((): undefined => undefined);

export const edgeViolation = (
	from: TPlace,
	target: string,
	file: string,
	site: TViolationSite,
): TViolation | undefined => {
	const to = placeOf(target);

	return (
		targetViolation(to, site) ??
		layerViolation(from, to, site) ??
		moduleViolation(from, to, target, site) ??
		areaViolation(from, to, file, site)
	);
};
