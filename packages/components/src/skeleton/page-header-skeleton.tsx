import type { FC, ReactElement } from "react";
import { Skeleton } from "../ui/skeleton.tsx";

type TPageHeaderSkeletonProps = {
	breadcrumb?: boolean;
	description?: boolean;
	action?: boolean;
};

export const PageHeaderSkeleton: FC<TPageHeaderSkeletonProps> = (
	props,
): ReactElement => (
	<div className="flex flex-col gap-6">
		{props.breadcrumb && <Skeleton className="h-4 w-36" />}
		<div className="flex items-start justify-between gap-4">
			<div className="flex w-full flex-col gap-2">
				<Skeleton className="h-7 w-40" />
				{props.description && <Skeleton className="h-4 w-96 max-w-full" />}
			</div>
			{props.action && <Skeleton className="h-8 w-28 shrink-0" />}
		</div>
	</div>
);
