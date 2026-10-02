import { Button } from "@app/components/ui/button";
import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
import { APP_MESSAGE, AUTH_MESSAGE } from "@app/messages";
import { QRCodeSVG } from "qrcode.react";
import type { FC, ReactElement } from "react";
import type { TOwnTwoFactor } from "#/routes/_authenticated/account/_hooks/use-own-two-factor.ts";

const CODE_ID = "two-factor-setup-code";
const QR_SIZE = 168;

type TTwoFactorSetupStepProps = {
	twoFactor: TOwnTwoFactor;
};

export const TwoFactorSetupStep: FC<TTwoFactorSetupStepProps> = (
	props,
): ReactElement => (
	<form
		className="flex flex-col gap-5 sm:flex-row sm:items-start"
		onSubmit={(event) => {
			event.preventDefault();
			props.twoFactor.verifySetup();
		}}
	>
		<div className="shrink-0 self-center rounded-lg bg-white p-3 sm:self-start">
			<QRCodeSVG value={props.twoFactor.totpUri} size={QR_SIZE} />
		</div>
		<div className="flex flex-1 flex-col gap-4">
			<p className="text-sm text-muted-foreground">
				{AUTH_MESSAGE.TWO_FACTOR_SCAN}
			</p>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-muted-foreground">
					{AUTH_MESSAGE.TWO_FACTOR_MANUAL_KEY}
				</span>
				<code className="break-all rounded bg-muted px-2 py-1 font-mono text-xs">
					{props.twoFactor.manualKey}
				</code>
			</div>
			<Field id={CODE_ID} label={AUTH_MESSAGE.FIELD_TWO_FACTOR_CODE}>
				{(control): ReactElement => (
					<Input
						{...control}
						inputMode="numeric"
						autoComplete="one-time-code"
						placeholder={AUTH_MESSAGE.TWO_FACTOR_CODE_PLACEHOLDER}
						value={props.twoFactor.code}
						onChange={(event) =>
							props.twoFactor.onCodeChange(event.target.value)
						}
					/>
				)}
			</Field>
			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={props.twoFactor.cancel}
				>
					{APP_MESSAGE.CANCEL}
				</Button>
				<Button
					type="submit"
					disabled={props.twoFactor.pending || props.twoFactor.code === ""}
				>
					{AUTH_MESSAGE.TWO_FACTOR_VERIFY_AND_ENABLE}
				</Button>
			</div>
		</div>
	</form>
);
