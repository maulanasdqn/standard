import type { TPagination } from "@app/schemas";

export type TPageInfo = TPagination & { total: number };

export const hasPreviousPage = ({ page }: TPageInfo): boolean => page > 1;

export const hasNextPage = ({ page, pageSize, total }: TPageInfo): boolean =>
	page * pageSize < total;
