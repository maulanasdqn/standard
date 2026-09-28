import { PageSkeleton } from "@app/components/skeleton/page-skeleton";
import { APP_MESSAGE } from "@app/messages";
import type { FC, ReactElement, ReactNode } from "react";

type TRouteSkeletonProps = {
	children: ReactNode;
};

export const RouteSkeleton: FC<TRouteSkeletonProps> = (props): ReactElement => (
	<PageSkeleton label={APP_MESSAGE.LOADING}>{props.children}</PageSkeleton>
);
