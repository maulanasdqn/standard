import { SIGN_UP_ENABLED } from "@app/schemas";
import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { FieldError } from "@app/components/ui/field-error";
import { AUTH_MESSAGE } from "@app/messages";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { AuthField } from "#/routes/_components/auth-field.tsx";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { AuthSubmit } from "#/routes/_components/auth-submit.tsx";
import { useLoginForm } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm: FC = (): ReactElement => {
	const { form, serverError, onSubmit } = useLoginForm();

	return (
		<form onSubmit={onSubmit}>
			<Stagger className="flex flex-col gap-6">
				<StaggerItem>
					<AuthHeading
						title={AUTH_MESSAGE.LOGIN_TITLE}
						description={AUTH_MESSAGE.LOGIN_DESCRIPTION}
					/>
				</StaggerItem>
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
					<StaggerItem>
						<form.Field name="password">
							{(field) => (
								<AuthField
									id={field.name}
									label={AUTH_MESSAGE.FIELD_PASSWORD}
									type="password"
									autoComplete="current-password"
									placeholder={AUTH_MESSAGE.PASSWORD_PLACEHOLDER}
									value={field.state.value}
									errorMap={field.state.meta.errorMap}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
									labelAside={
										<Link
											to="/forgot-password"
											className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
										>
											{AUTH_MESSAGE.FORGOT_PASSWORD_LINK}
										</Link>
									}
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
									label={AUTH_MESSAGE.LOGIN_ACTION}
									pendingLabel={AUTH_MESSAGE.SIGNING_IN}
								/>
							)}
						</form.Subscribe>
					</StaggerItem>
					{SIGN_UP_ENABLED && (
						<StaggerItem>
							<AuthFooterLink
								prompt={AUTH_MESSAGE.NO_ACCOUNT}
								label={AUTH_MESSAGE.SIGN_UP_LINK}
								to="/register"
							/>
						</StaggerItem>
					)}
				</div>
			</Stagger>
		</form>
	);
};
