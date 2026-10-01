import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { APP_MESSAGE, AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import type { TOwnTwoFactor } from "#/routes/_authenticated/account/_hooks/use-own-two-factor.ts";

const PASSWORD_ID = "two-factor-password";

type TTwoFactorPasswordStepProps = {
	twoFactor: TOwnTwoFactor;
};

export const TwoFactorPasswordStep: FC<TTwoFactorPasswordStepProps> = (
	props,
): ReactElement => (
	<form
		className="flex flex-col gap-3 sm:flex-row sm:items-end"
		onSubmit={(event) => {
			event.preventDefault();
			props.twoFactor.submitPassword();
		}}
	>
		<div className="flex flex-1 flex-col gap-1.5">
			<Label htmlFor={PASSWORD_ID}>
				{AUTH_MESSAGE.TWO_FACTOR_PASSWORD_PROMPT}
			</Label>
			<Input
				id={PASSWORD_ID}
				type="password"
				autoComplete="current-password"
				placeholder={AUTH_MESSAGE.PASSWORD_PLACEHOLDER}
				value={props.twoFactor.password}
				onChange={(event) =>
					props.twoFactor.onPasswordChange(event.target.value)
				}
			/>
		</div>
		<div className="flex gap-2">
			<Button type="button" variant="outline" onClick={props.twoFactor.cancel}>
				{APP_MESSAGE.CANCEL}
			</Button>
			<Button
				type="submit"
				disabled={props.twoFactor.pending || props.twoFactor.password === ""}
			>
				{AUTH_MESSAGE.TWO_FACTOR_CONTINUE}
			</Button>
		</div>
	</form>
);
