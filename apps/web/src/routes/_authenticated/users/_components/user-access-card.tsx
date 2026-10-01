import { Button } from "@app/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { USER_MESSAGE } from "@app/messages";
import { type TUser, type TUserStatus, USER_STATUS } from "@app/schemas";
import { UserCheck, UserX } from "lucide-react";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { UserStatusBadge } from "#/routes/_authenticated/users/_components/user-status-badge.tsx";
import { useUserAccess } from "#/routes/_authenticated/users/_hooks/use-user-access.ts";

type TUserAccessCardProps = {
	user: TUser;
};

const accessDescription = (status: TUserStatus): string =>
	match(status)
		.with(USER_STATUS.ACTIVE, () => USER_MESSAGE.ACCESS_ACTIVE_DESCRIPTION)
		.with(USER_STATUS.PENDING, () => USER_MESSAGE.ACCESS_PENDING_DESCRIPTION)
		.with(
			USER_STATUS.DEACTIVATED,
			() => USER_MESSAGE.ACCESS_DEACTIVATED_DESCRIPTION,
		)
		.exhaustive();

export const UserAccessCard: FC<TUserAccessCardProps> = (
	props,
): ReactElement => {
	const access = useUserAccess(props.user);

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<CardTitle className="flex items-center gap-2">
						{USER_MESSAGE.ACCESS_TITLE}
						<UserStatusBadge status={access.status} />
					</CardTitle>
					<CardDescription>{accessDescription(access.status)}</CardDescription>
				</div>
				<Button
					variant={access.deactivated ? "default" : "outline"}
					size="sm"
					disabled={access.pending}
					onClick={() => access.confirm.request()}
					className={
						access.deactivated
							? undefined
							: "text-destructive hover:text-destructive"
					}
				>
					{access.deactivated ? <UserCheck /> : <UserX />}
					{access.deactivated
						? USER_MESSAGE.ACTION_REACTIVATE
						: USER_MESSAGE.ACTION_DEACTIVATE}
				</Button>
			</CardHeader>
			<ConfirmDialog
				open={access.confirm.open}
				title={
					access.deactivated
						? USER_MESSAGE.REACTIVATE_CONFIRM_TITLE
						: USER_MESSAGE.DEACTIVATE_CONFIRM_TITLE
				}
				description={
					access.deactivated
						? USER_MESSAGE.REACTIVATE_CONFIRM_DESCRIPTION
						: USER_MESSAGE.DEACTIVATE_CONFIRM_DESCRIPTION
				}
				confirmLabel={
					access.deactivated
						? USER_MESSAGE.ACTION_REACTIVATE
						: USER_MESSAGE.ACTION_DEACTIVATE
				}
				destructive={!access.deactivated}
				onOpenChange={access.confirm.onOpenChange}
				onConfirm={access.confirm.onConfirm}
			/>
		</Card>
	);
};
