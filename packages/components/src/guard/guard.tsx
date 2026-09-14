import type { TPermission } from "@app/permissions";
import type { FC, ReactElement, ReactNode } from "react";
import { match } from "ts-pattern";
import { usePermissions } from "./use-permissions.ts";

type TGuardProps = {
	permissions: readonly TPermission[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	children: ReactNode;
};

export const Guard: FC<TGuardProps> = (props): ReactElement => {
	const { permissions, mode = "all", fallback = null, children } = props;

	const { canAll, canAny } = usePermissions();

	const allowed = match(mode)
		.with("all", () => canAll(permissions))
		.with("any", () => canAny(permissions))
		.exhaustive();

	return <>{allowed ? children : fallback}</>;
};
