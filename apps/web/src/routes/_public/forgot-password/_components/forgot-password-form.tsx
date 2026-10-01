import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { FieldError } from "@app/components/ui/field-error";
import { AUTH_MESSAGE } from "@app/messages";
import { MailCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { AuthField } from "#/routes/_components/auth-field.tsx";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { AuthSubmit } from "#/routes/_components/auth-submit.tsx";
import { useForgotPasswordForm } from "#/routes/_public/forgot-password/_hooks/use-forgot-password-form.ts";

export const ForgotPasswordForm: FC = (): ReactElement => {
	const { form, serverError, sent, onSubmit } = useForgotPasswordForm();

	return (
		<form onSubmit={onSubmit} noValidate>
			<Stagger className="flex flex-col gap-6">
				<StaggerItem>
					<AuthHeading
						title={AUTH_MESSAGE.FORGOT_TITLE}
						description={AUTH_MESSAGE.FORGOT_DESCRIPTION}
					/>
				</StaggerItem>
				{sent ? (
					<StaggerItem>
						<output className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
							<MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
							{AUTH_MESSAGE.FORGOT_SENT}
						</output>
					</StaggerItem>
				) : (
					<div className="grid gap-6">
						<StaggerItem>
							<form.Field name="email">
								{(field) => (
									<AuthField
										id={field.name}
										label={AUTH_MESSAGE.FIELD_EMAIL}
										type="email"
										autoComplete="email"
										placeholder={AUTH_MESSAGE.EMAIL_PLACEHOLDER}
										value={field.state.value}
										errorMap={field.state.meta.errorMap}
										onBlur={field.handleBlur}
										onChange={field.handleChange}
									/>
								)}
							</form.Field>
						</StaggerItem>
						<FieldError
							errors={serverError ? [{ message: serverError }] : []}
						/>
						<StaggerItem>
							<form.Subscribe selector={(state) => state.isSubmitting}>
								{(isSubmitting) => (
									<AuthSubmit
										pending={isSubmitting}
										label={AUTH_MESSAGE.FORGOT_ACTION}
										pendingLabel={AUTH_MESSAGE.FORGOT_SENDING}
									/>
								)}
							</form.Subscribe>
						</StaggerItem>
					</div>
				)}
				<StaggerItem>
					<AuthFooterLink label={AUTH_MESSAGE.BACK_TO_SIGN_IN} to="/login" />
				</StaggerItem>
			</Stagger>
		</form>
	);
};
