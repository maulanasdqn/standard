import {
	SORT_DIRECTION,
	type TPagination,
	type TSortDirection,
} from "@app/schemas";
import { asc, desc, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { match } from "ts-pattern";

export type TRowPage<TRow> = {
	items: TRow[];
	total: number;
};

export const offsetFor = ({ page, pageSize }: TPagination): number =>
	(page - 1) * pageSize;

export const orderFor = (column: AnyPgColumn, direction: TSortDirection): SQL =>
	match(direction)
		.with(SORT_DIRECTION.ASC, () => asc(column))
		.with(SORT_DIRECTION.DESC, () => desc(column))
		.exhaustive();
