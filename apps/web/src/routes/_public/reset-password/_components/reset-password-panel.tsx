import type { FC, ReactElement } from "react";
import { ResetLinkInvalid } from "#/routes/_public/reset-password/_components/reset-link-invalid.tsx";
import { ResetPasswordForm } from "#/routes/_public/reset-password/_components/reset-password-form.tsx";
import { useResetPasswordForm } from "#/routes/_public/reset-password/_hooks/use-reset-password-form.ts";

type TResetPasswordPanelProps = {
	token: string;
	invite: boolean;
};

export const ResetPasswordPanel: FC<TResetPasswordPanelProps> = (
	props,
): ReactElement => {
	const reset = useResetPasswordForm(props.token, props.invite);

	return reset.linkInvalid ? (
		<ResetLinkInvalid />
	) : (
		<ResetPasswordForm reset={reset} invite={props.invite} />
	);
};
