import type { TNoteListInput, TNoteListSearch } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { dayRangeToInstants } from "#/libs/table/day-range.ts";

export const toNoteListInput = (search: TNoteListSearch): TNoteListInput =>
	D.merge(search, dayRangeToInstants(search));
