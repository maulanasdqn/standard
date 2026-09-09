export type IPageInput = {
	page: number;
	pageSize: number;
};

export const offsetFor = ({ page, pageSize }: IPageInput): number =>
	(page - 1) * pageSize;
