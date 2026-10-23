import { appContract, contractProceduresOf } from "@app/contract";
import { A, S } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";
import { ROUTE_PREFIX } from "#/platform/http/route-paths.ts";

export const OPENAPI_MOUNT_ROUTE = `${ROUTE_PREFIX.OPENAPI}/*`;

const SEGMENT_SEPARATOR = "/";
const PARAM_SEGMENT = /^\{[^}]+\}$/;

type TRestTemplate = {
	label: string;
	segments: readonly string[];
	literals: number;
};

const segmentsOf = (path: string): readonly string[] =>
	A.filter(
		S.split(path, SEGMENT_SEPARATOR),
		(segment): boolean => segment !== "",
	);

const isParam = (segment: string): boolean => PARAM_SEGMENT.test(segment);

const templateOf = (path: string): TRestTemplate => {
	const segments = segmentsOf(path);
	return {
		label: `${ROUTE_PREFIX.OPENAPI}${path}`,
		segments,
		literals: A.length(A.reject(segments, isParam)),
	};
};

const REST_TEMPLATES: readonly TRestTemplate[] = A.sort(
	A.map(
		A.uniq(
			A.filterMap(
				contractProceduresOf(appContract),
				(entry): string | undefined => entry.procedure["~orpc"].route.path,
			),
		),
		templateOf,
	),
	(left, right): number => right.literals - left.literals,
);

const templateMatches = (
	template: TRestTemplate,
	segments: readonly string[],
): boolean =>
	A.length(template.segments) === A.length(segments) &&
	A.every(
		A.zip(template.segments, segments),
		([expected, actual]): boolean => isParam(expected) || expected === actual,
	);

const templateLabel = (route: string, path: string): string => {
	const segments = segmentsOf(S.sliceToEnd(path, ROUTE_PREFIX.OPENAPI.length));
	return match(
		A.find(REST_TEMPLATES, (template): boolean =>
			templateMatches(template, segments),
		),
	)
		.with(P.nonNullable, (found): string => found.label)
		.otherwise((): string => route);
};

export const restRouteLabel = (route: string, path: string): string =>
	match(route === OPENAPI_MOUNT_ROUTE)
		.with(true, (): string => templateLabel(route, path))
		.otherwise((): string => route);
