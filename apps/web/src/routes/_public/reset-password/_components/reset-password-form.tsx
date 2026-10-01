import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { FieldError } from "@app/components/ui/field-error";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { AuthField } from "#/routes/_components/auth-field.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { AuthSubmit } from "#/routes/_components/auth-submit.tsx";
import type { TResetPasswordForm } from "#/routes/_public/reset-password/_hooks/use-reset-password-form.ts";

type TResetPasswordFormProps = {
	reset: TResetPasswordForm;
};

export const ResetPasswordForm: FC<TResetPasswordFormProps> = (
	props,
): ReactElement => {
	const { form, serverError, onSubmit } = props.reset;

	return (
		<form onSubmit={onSubmit} noValidate>
			<Stagger className="flex flex-col gap-6">
				<StaggerItem>
					<AuthHeading
						title={AUTH_MESSAGE.RESET_TITLE}
						description={AUTH_MESSAGE.RESET_DESCRIPTION}
					/>
				</StaggerItem>
				<div className="grid gap-5">
					<StaggerItem>
						<form.Field name="password">
							{(field) => (
								<AuthField
									id={field.name}
									label={AUTH_MESSAGE.FIELD_NEW_PASSWORD}
									type="password"
									autoComplete="new-password"
									placeholder={AUTH_MESSAGE.NEW_PASSWORD_PLACEHOLDER}
									hint={AUTH_MESSAGE.PASSWORD_RULE_HINT}
									value={field.state.value}
									errorMap={field.state.meta.errorMap}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
								/>
							)}
						</form.Field>
					</StaggerItem>
					<StaggerItem>
						<form.Field name="confirmPassword">
							{(field) => (
								<AuthField
									id={field.name}
									label={AUTH_MESSAGE.FIELD_CONFIRM_PASSWORD}
									type="password"
									autoComplete="new-password"
									placeholder={AUTH_MESSAGE.CONFIRM_PASSWORD_PLACEHOLDER}
									value={field.state.value}
									errorMap={field.state.meta.errorMap}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
								/>
							)}
						</form.Field>
					</StaggerItem>
					<FieldError errors={serverError ? [{ message: serverError }] : []} />
					<StaggerItem>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<AuthSubmit
									pending={isSubmitting}
									label={AUTH_MESSAGE.PASSWORD_UPDATE}
									pendingLabel={AUTH_MESSAGE.PASSWORD_UPDATING}
								/>
							)}
						</form.Subscribe>
					</StaggerItem>
				</div>
			</Stagger>
		</form>
	);
};
