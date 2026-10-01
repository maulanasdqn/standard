import { Badge } from "@app/components/ui/badge";
import { cn } from "@app/components/lib/utils";
import { USER_MESSAGE } from "@app/messages";
import { type TUserStatus, USER_STATUS } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";

type TUserStatusBadgeProps = {
	status: TUserStatus;
};

const statusLabel = (status: TUserStatus): string =>
	match(status)
		.with(USER_STATUS.ACTIVE, () => USER_MESSAGE.STATUS_ACTIVE)
		.with(USER_STATUS.PENDING, () => USER_MESSAGE.STATUS_PENDING)
		.with(USER_STATUS.DEACTIVATED, () => USER_MESSAGE.STATUS_DEACTIVATED)
		.exhaustive();

const statusDot = (status: TUserStatus): string =>
	match(status)
		.with(USER_STATUS.ACTIVE, () => "bg-emerald-500")
		.with(USER_STATUS.PENDING, () => "bg-amber-500")
		.with(USER_STATUS.DEACTIVATED, () => "bg-muted-foreground")
		.exhaustive();

export const UserStatusBadge: FC<TUserStatusBadgeProps> = (
	props,
): ReactElement => (
	<Badge
		variant="outline"
		className={cn(
			"gap-1.5 font-normal",
			props.status === USER_STATUS.DEACTIVATED && "text-muted-foreground",
		)}
	>
		<span className={cn("size-1.5 rounded-full", statusDot(props.status))} />
		{statusLabel(props.status)}
	</Badge>
);
