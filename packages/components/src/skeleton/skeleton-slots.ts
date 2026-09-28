import { A } from "@mobily/ts-belt";

export const skeletonSlots = (count: number): readonly number[] =>
	A.makeWithIndex(count, (index): number => index);
