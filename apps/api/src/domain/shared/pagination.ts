import type { TPagination } from "@app/schemas";

export const offsetFor = ({ page, pageSize }: TPagination): number =>
	(page - 1) * pageSize;
