import { and, gte, lte, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { match, P } from "ts-pattern";

const boundWhere = (
	value: string | undefined,
	toWhere: (at: Date) => SQL,
): SQL | undefined =>
	match(value)
		.with(P.nonNullable, (at) => toWhere(new Date(at)))
		.otherwise(() => undefined);

export const dateRangeWhere = (
	column: AnyPgColumn,
	from: string | undefined,
	to: string | undefined,
): SQL | undefined =>
	and(
		boundWhere(from, (at) => gte(column, at)),
		boundWhere(to, (at) => lte(column, at)),
	);
