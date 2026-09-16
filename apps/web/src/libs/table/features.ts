import { tableFeatures } from "@tanstack/react-table";

export type TColumnMeta = {
	className?: string;
};

export const TABLE_FEATURES = tableFeatures({
	columnMeta: {} as TColumnMeta,
});

export type TTableFeatures = typeof TABLE_FEATURES;
