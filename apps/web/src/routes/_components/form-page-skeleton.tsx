import { PageHeaderSkeleton } from "@app/components/skeleton/page-header-skeleton";
import type { FC, ReactElement, ReactNode } from "react";
import { RouteSkeleton } from "#/routes/_components/route-skeleton.tsx";

type TFormPageSkeletonProps = {
	children: ReactNode;
};

export const FormPageSkeleton: FC<TFormPageSkeletonProps> = (
	props,
): ReactElement => (
	<RouteSkeleton>
		<PageHeaderSkeleton breadcrumb description action />
		{props.children}
	</RouteSkeleton>
);
