import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { FieldError } from "@app/components/ui/field-error";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { AuthField } from "#/routes/_components/auth-field.tsx";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { AuthSubmit } from "#/routes/_components/auth-submit.tsx";
import type { TRegisterForm } from "#/routes/_public/register/_hooks/use-register-form.ts";

type TRegisterFormProps = {
	register: TRegisterForm;
};

export const RegisterForm: FC<TRegisterFormProps> = (props): ReactElement => {
	const { form, serverError, onSubmit } = props.register;

	return (
		<form onSubmit={onSubmit} noValidate>
			<Stagger className="flex flex-col gap-6">
				<StaggerItem>
					<AuthHeading
						title={AUTH_MESSAGE.REGISTER_TITLE}
						description={AUTH_MESSAGE.REGISTER_DESCRIPTION}
					/>
				</StaggerItem>
				<div className="grid gap-5">
					<StaggerItem>
						<form.Field name="name">
							{(field) => (
								<AuthField
									id={field.name}
									label={AUTH_MESSAGE.FIELD_NAME}
									type="text"
									autoComplete="name"
									placeholder={AUTH_MESSAGE.NAME_PLACEHOLDER}
									value={field.state.value}
									errorMap={field.state.meta.errorMap}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
								/>
							)}
						</form.Field>
					</StaggerItem>
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
									autoComplete="new-password"
									placeholder={AUTH_MESSAGE.PASSWORD_PLACEHOLDER}
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
									label={AUTH_MESSAGE.FIELD_PASSWORD_CONFIRM}
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
									label={AUTH_MESSAGE.REGISTER_ACTION}
									pendingLabel={AUTH_MESSAGE.REGISTERING}
								/>
							)}
						</form.Subscribe>
					</StaggerItem>
					<StaggerItem>
						<AuthFooterLink
							prompt={AUTH_MESSAGE.HAVE_ACCOUNT}
							label={AUTH_MESSAGE.SIGN_IN_LINK}
							to="/login"
						/>
					</StaggerItem>
				</div>
			</Stagger>
		</form>
	);
};
