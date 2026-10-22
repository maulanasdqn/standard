import { A } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";
import type { z } from "zod";

const ENV_PARSE_MESSAGE = {
	JSON_INVALID: "Must be valid JSON.",
	JSON_NOT_OBJECT: "Must be a JSON object, not an array, a string, or null.",
} as const;

type TJsonDecoded = { ok: true; value: unknown } | { ok: false };

export const blankAsUndefined = (value: unknown): unknown =>
	match(value)
		.with("", (): undefined => undefined)
		.otherwise((found): unknown => found);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const jsonDecode = (found: string): TJsonDecoded => {
	try {
		return { ok: true, value: JSON.parse(found) };
	} catch {
		return { ok: false };
	}
};

const jsonObjectDecode = (
	found: string,
	context: z.RefinementCtx,
): Record<string, unknown> | undefined =>
	match(jsonDecode(found))
		.with({ ok: false }, (): undefined => {
			context.addIssue({
				code: "custom",
				message: ENV_PARSE_MESSAGE.JSON_INVALID,
			});
			return undefined;
		})
		.otherwise(({ value }): Record<string, unknown> | undefined =>
			match(value)
				.when(isPlainObject, (decoded): Record<string, unknown> => decoded)
				.otherwise((): undefined => {
					context.addIssue({
						code: "custom",
						message: ENV_PARSE_MESSAGE.JSON_NOT_OBJECT,
					});
					return undefined;
				}),
		);

export const jsonObjectParse = (
	value: string | undefined,
	context: z.RefinementCtx,
): Record<string, unknown> | undefined =>
	match(value)
		.with(P.nullish, (): undefined => undefined)
		.otherwise((found): Record<string, unknown> | undefined =>
			jsonObjectDecode(found, context),
		);

export const stringListParse = (value: string): readonly string[] =>
	A.filterMap(value.split(","), (item): string | undefined => {
		const trimmed = item.trim();
		return trimmed === "" ? undefined : trimmed;
	});
