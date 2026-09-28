import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { cn } from "../lib/utils.ts";
import { Skeleton } from "../ui/skeleton.tsx";
import { skeletonSlots } from "./skeleton-slots.ts";

type TCardSkeletonProps = {
	className?: string;
};

type TCardGridSkeletonProps = {
	count: number;
	className?: string;
	cardClassName?: string;
};

export const CardSkeleton: FC<TCardSkeletonProps> = (props): ReactElement => (
	<Skeleton className={cn("h-[106px] rounded-xl", props.className)} />
);

export const CardGridSkeleton: FC<TCardGridSkeletonProps> = (
	props,
): ReactElement => (
	<div
		className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", props.className)}
	>
		{A.map(skeletonSlots(props.count), (card) => (
			<CardSkeleton key={card} className={props.cardClassName} />
		))}
	</div>
);
