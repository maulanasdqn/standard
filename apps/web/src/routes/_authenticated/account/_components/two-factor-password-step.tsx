import { Button } from "@app/components/ui/button";
import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
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
		<Field
			id={PASSWORD_ID}
			label={AUTH_MESSAGE.TWO_FACTOR_PASSWORD_PROMPT}
			className="flex-1"
		>
			{(control): ReactElement => (
				<Input
					{...control}
					type="password"
					autoComplete="current-password"
					placeholder={AUTH_MESSAGE.PASSWORD_PLACEHOLDER}
					value={props.twoFactor.password}
					onChange={(event) =>
						props.twoFactor.onPasswordChange(event.target.value)
					}
				/>
			)}
		</Field>
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
