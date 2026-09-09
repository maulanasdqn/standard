import type { TPermission } from "@app/permissions";
import type { ReactElement, ReactNode } from "react";
import { usePermissions } from "./use-permissions.ts";

type TGuardProps = {
	permissions: readonly TPermission[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	children: ReactNode;
};

/** Renders `children` only when the current user holds the required permissions. */
export const Guard = ({
	permissions,
	mode = "all",
	fallback = null,
	children,
}: TGuardProps): ReactElement => {
	const { canAll, canAny } = usePermissions();
	const allowed = mode === "all" ? canAll(permissions) : canAny(permissions);

	return <>{allowed ? children : fallback}</>;
};
