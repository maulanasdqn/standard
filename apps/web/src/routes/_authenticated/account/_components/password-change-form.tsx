import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import type { ReactElement } from "react";
import { usePasswordChangeForm } from "#/routes/_authenticated/account/_hooks/use-password-change-form.ts";

export const PasswordChangeForm = (): ReactElement => {
	const { form, serverError, onSubmit } = usePasswordChangeForm();

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-4 border border-neutral-200 p-4"
		>
			<h2 className="font-medium">Change password</h2>
			<form.Field name="currentPassword">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Current password</Label>
						<Input
							id={field.name}
							type="password"
							autoComplete="current-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="newPassword">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>New password</Label>
						<Input
							id={field.name}
							type="password"
							autoComplete="new-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="confirmPassword">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Confirm new password</Label>
						<Input
							id={field.name}
							type="password"
							autoComplete="new-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<FieldError errors={serverError ? [{ message: serverError }] : []} />
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting} className="self-start">
						{isSubmitting ? "Updating…" : "Update password"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
};
