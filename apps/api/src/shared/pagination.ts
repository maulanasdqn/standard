import type { TPagination } from "@app/schemas";

export type TRowPage<TRow> = {
	items: TRow[];
	total: number;
};

export const offsetFor = ({ page, pageSize }: TPagination): number =>
	(page - 1) * pageSize;
