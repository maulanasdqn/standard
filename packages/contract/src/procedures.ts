import { A, D } from "@mobily/ts-belt";
import { type AnyContractProcedure, isContractProcedure } from "@orpc/contract";

export type TContractProcedureEntry = {
	path: readonly string[];
	procedure: AnyContractProcedure;
};

const isRouterNode = (node: unknown): node is Record<string, unknown> =>
	typeof node === "object" && node !== null;

const childrenOf = (node: unknown): readonly (readonly [string, unknown])[] =>
	isRouterNode(node) ? D.toPairs(node) : [];

export const contractProceduresOf = (
	node: unknown,
	path: readonly string[] = [],
): readonly TContractProcedureEntry[] =>
	isContractProcedure(node)
		? [{ path, procedure: node }]
		: A.flat(
				A.map(
					childrenOf(node),
					([key, child]): readonly TContractProcedureEntry[] =>
						contractProceduresOf(child, [...path, key]),
				),
			);
