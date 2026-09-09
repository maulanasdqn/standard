import type { TPermission } from "@app/permissions";
import type { ReactElement, ReactNode } from "react";
import { match } from "ts-pattern";
import { usePermissions } from "./use-permissions.ts";

type TGuardProps = {
	permissions: readonly TPermission[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	children: ReactNode;
};

export const Guard = ({
	permissions,
	mode = "all",
	fallback = null,
	children,
}: TGuardProps): ReactElement => {
	const { canAll, canAny } = usePermissions();

	const allowed = match(mode)
		.with("all", () => canAll(permissions))
		.with("any", () => canAny(permissions))
		.exhaustive();

	return <>{allowed ? children : fallback}</>;
};
