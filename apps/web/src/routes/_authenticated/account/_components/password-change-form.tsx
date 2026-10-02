import { Button } from "@app/components/ui/button";
import { Field } from "@app/components/ui/field";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import type { FC, ReactElement } from "react";
import { usePasswordChangeForm } from "#/routes/_authenticated/account/_hooks/use-password-change-form.ts";
import { Card, CardContent } from "@app/components/ui/card";
import { AUTH_MESSAGE } from "@app/messages";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";

export const PasswordChangeForm: FC = (): ReactElement => {
	const { form, serverError, onSubmit, confirm, isPending } =
		usePasswordChangeForm();

	return (
		<Card>
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<h2 className="font-medium">{AUTH_MESSAGE.PASSWORD_CHANGE_TITLE}</h2>
					<form.Field name="currentPassword">
						{(field) => (
							<Field
								id={field.name}
								label={AUTH_MESSAGE.FIELD_CURRENT_PASSWORD}
								errors={field.state.meta.errors}
							>
								{(control): ReactElement => (
									<Input
										{...control}
										type="password"
										autoComplete="current-password"
										placeholder={AUTH_MESSAGE.CURRENT_PASSWORD_PLACEHOLDER}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="newPassword">
						{(field) => (
							<Field
								id={field.name}
								label={AUTH_MESSAGE.FIELD_NEW_PASSWORD}
								errors={field.state.meta.errors}
							>
								{(control): ReactElement => (
									<Input
										{...control}
										type="password"
										autoComplete="new-password"
										placeholder={AUTH_MESSAGE.NEW_PASSWORD_PLACEHOLDER}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="confirmPassword">
						{(field) => (
							<Field
								id={field.name}
								label={AUTH_MESSAGE.FIELD_CONFIRM_PASSWORD}
								errors={field.state.meta.errors}
							>
								{(control): ReactElement => (
									<Input
										{...control}
										type="password"
										autoComplete="new-password"
										placeholder={AUTH_MESSAGE.CONFIRM_PASSWORD_PLACEHOLDER}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
						)}
					</form.Field>
					<FieldError errors={serverError ? [{ message: serverError }] : []} />
					<Button type="submit" disabled={isPending} className="self-start">
						{isPending
							? AUTH_MESSAGE.PASSWORD_UPDATING
							: AUTH_MESSAGE.PASSWORD_UPDATE}
					</Button>
				</form>
				<ConfirmDialog
					open={confirm.open}
					title={AUTH_MESSAGE.PASSWORD_CHANGE_CONFIRM_TITLE}
					description={AUTH_MESSAGE.PASSWORD_CHANGE_CONFIRM_DESCRIPTION}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
