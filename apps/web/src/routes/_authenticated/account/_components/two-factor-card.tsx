import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { AUTH_MESSAGE } from "@app/messages";
import { ShieldCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { TwoFactorBackupCodes } from "#/routes/_authenticated/account/_components/two-factor-backup-codes.tsx";
import { TwoFactorPasswordStep } from "#/routes/_authenticated/account/_components/two-factor-password-step.tsx";
import { TwoFactorSetupStep } from "#/routes/_authenticated/account/_components/two-factor-setup-step.tsx";
import {
	TWO_FACTOR_ACTION,
	TWO_FACTOR_STEP,
} from "#/routes/_authenticated/account/_constants/two-factor.ts";
import {
	type TOwnTwoFactor,
	useOwnTwoFactor,
} from "#/routes/_authenticated/account/_hooks/use-own-two-factor.ts";

type TIdleActionsProps = {
	twoFactor: TOwnTwoFactor;
};

const IdleActions: FC<TIdleActionsProps> = (props): ReactElement =>
	props.twoFactor.enabled ? (
		<div className="flex flex-wrap gap-2">
			<Button
				variant="outline"
				onClick={() => props.twoFactor.start(TWO_FACTOR_ACTION.REGENERATE)}
			>
				{AUTH_MESSAGE.TWO_FACTOR_REGENERATE}
			</Button>
			<Button
				variant="outline"
				className="text-destructive hover:text-destructive"
				onClick={() => props.twoFactor.start(TWO_FACTOR_ACTION.DISABLE)}
			>
				{AUTH_MESSAGE.TWO_FACTOR_TURN_OFF}
			</Button>
		</div>
	) : (
		<Button onClick={() => props.twoFactor.start(TWO_FACTOR_ACTION.ENABLE)}>
			<ShieldCheck />
			{AUTH_MESSAGE.TWO_FACTOR_TURN_ON}
		</Button>
	);

export const TwoFactorCard: FC = (): ReactElement => {
	const twoFactor = useOwnTwoFactor();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{AUTH_MESSAGE.TWO_FACTOR_TITLE}
					<Badge variant="outline" className="gap-1.5 font-normal">
						<span
							className={
								twoFactor.enabled
									? "size-1.5 rounded-full bg-emerald-500"
									: "size-1.5 rounded-full bg-muted-foreground"
							}
						/>
						{twoFactor.enabled
							? AUTH_MESSAGE.TWO_FACTOR_ON_BADGE
							: AUTH_MESSAGE.TWO_FACTOR_OFF_BADGE}
					</Badge>
				</CardTitle>
				<CardDescription>
					{twoFactor.enabled
						? AUTH_MESSAGE.TWO_FACTOR_DESCRIPTION_ON
						: AUTH_MESSAGE.TWO_FACTOR_DESCRIPTION_OFF}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{match(twoFactor.step)
					.with(TWO_FACTOR_STEP.IDLE, () => (
						<IdleActions twoFactor={twoFactor} />
					))
					.with(TWO_FACTOR_STEP.PASSWORD, () => (
						<TwoFactorPasswordStep twoFactor={twoFactor} />
					))
					.with(TWO_FACTOR_STEP.SETUP, () => (
						<TwoFactorSetupStep twoFactor={twoFactor} />
					))
					.with(TWO_FACTOR_STEP.CODES, () => (
						<TwoFactorBackupCodes
							codes={twoFactor.backupCodes}
							onDone={twoFactor.finish}
						/>
					))
					.exhaustive()}
			</CardContent>
		</Card>
	);
};
