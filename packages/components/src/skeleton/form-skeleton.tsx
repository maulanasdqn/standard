import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { cn } from "../lib/utils.ts";
import { Skeleton } from "../ui/skeleton.tsx";
import { skeletonSlots } from "./skeleton-slots.ts";

const FORM_SKELETON_DEFAULT = {
	FIELDS: 2,
} as const;

type TFieldSkeletonProps = {
	tall?: boolean;
};

type TFormSkeletonProps = {
	fields?: number;
	twoColumn?: boolean;
	textArea?: boolean;
	footer?: boolean;
};

const FieldSkeleton: FC<TFieldSkeletonProps> = (props): ReactElement => (
	<div className="flex flex-col gap-2">
		<Skeleton className="h-4 w-24" />
		<Skeleton className={cn("w-full", props.tall ? "h-40" : "h-9")} />
	</div>
);

export const FormSkeleton: FC<TFormSkeletonProps> = (props): ReactElement => {
	const { fields = FORM_SKELETON_DEFAULT.FIELDS, footer = true } = props;

	return (
		<div className="flex flex-col gap-6 rounded-xl border bg-card py-6 shadow-sm">
			<div className="flex flex-col gap-2 px-6">
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-4 w-72 max-w-full" />
			</div>
			<div
				className={cn("grid gap-6 px-6", props.twoColumn && "sm:grid-cols-2")}
			>
				{A.map(skeletonSlots(fields), (field) => (
					<FieldSkeleton key={field} />
				))}
				{props.textArea && (
					<div className="sm:col-span-full">
						<FieldSkeleton tall />
					</div>
				)}
			</div>
			{footer && (
				<div className="flex justify-end gap-2 border-t px-6 pt-6">
					<Skeleton className="h-9 w-20" />
					<Skeleton className="h-9 w-28" />
				</div>
			)}
		</div>
	);
};
