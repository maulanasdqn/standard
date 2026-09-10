import type { TUserList } from "@app/schemas";

export type TPageInfo = Pick<TUserList, "page" | "pageSize" | "total">;

export const hasPreviousPage = ({ page }: TPageInfo): boolean => page > 1;

export const hasNextPage = ({ page, pageSize, total }: TPageInfo): boolean =>
	page * pageSize < total;
