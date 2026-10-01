import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { USER_MESSAGE } from "@app/messages";
import type { TUser } from "@app/schemas";
import { ShieldOff } from "lucide-react";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { useUserTwoFactor } from "#/routes/_authenticated/users/_hooks/use-user-two-factor.ts";

type TUserTwoFactorCardProps = {
	user: TUser;
};

export const UserTwoFactorCard: FC<TUserTwoFactorCardProps> = (
	props,
): ReactElement => {
	const twoFactor = useUserTwoFactor(props.user);
	const enabled = props.user.twoFactorEnabled;

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<CardTitle className="flex items-center gap-2">
						{USER_MESSAGE.TWO_FACTOR_TITLE}
						<Badge variant="outline" className="gap-1.5 font-normal">
							<span
								className={
									enabled
										? "size-1.5 rounded-full bg-emerald-500"
										: "size-1.5 rounded-full bg-muted-foreground"
								}
							/>
							{enabled
								? USER_MESSAGE.TWO_FACTOR_ON
								: USER_MESSAGE.TWO_FACTOR_OFF}
						</Badge>
					</CardTitle>
					<CardDescription>
						{enabled
							? USER_MESSAGE.TWO_FACTOR_ON_DESCRIPTION
							: USER_MESSAGE.TWO_FACTOR_OFF_DESCRIPTION}
					</CardDescription>
				</div>
				{enabled && (
					<Button
						variant="outline"
						size="sm"
						disabled={twoFactor.pending}
						className="text-destructive hover:text-destructive"
						onClick={() => twoFactor.confirm.request()}
					>
						<ShieldOff />
						{USER_MESSAGE.TWO_FACTOR_RESET}
					</Button>
				)}
			</CardHeader>
			<ConfirmDialog
				open={twoFactor.confirm.open}
				title={USER_MESSAGE.TWO_FACTOR_RESET_CONFIRM_TITLE}
				description={USER_MESSAGE.TWO_FACTOR_RESET_CONFIRM_DESCRIPTION}
				confirmLabel={USER_MESSAGE.TWO_FACTOR_RESET}
				destructive
				onOpenChange={twoFactor.confirm.onOpenChange}
				onConfirm={twoFactor.confirm.onConfirm}
			/>
		</Card>
	);
};
