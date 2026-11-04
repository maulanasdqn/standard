import { ProgressBar } from "@app/components/ui/progress-bar";
import type { FC, ReactElement } from "react";
import { useRouteLoading } from "#/routes/_hooks/use-route-loading.ts";

export const RouteProgress: FC = (): ReactElement => {
	const loading = useRouteLoading();

	return (
		<ProgressBar active={loading} className="absolute inset-x-0 bottom-0" />
	);
};
