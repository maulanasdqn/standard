import { A, O, pipe } from "@mobily/ts-belt";

const pathLength = (path: string): number => path.length;

export const navActiveTarget = <TTarget extends string>(
	targets: readonly TTarget[],
	matches: (target: TTarget) => boolean,
): TTarget | undefined =>
	pipe(
		targets,
		A.filter(matches),
		A.sort((left, right): number => pathLength(right) - pathLength(left)),
		A.head,
		O.toUndefined,
	);
