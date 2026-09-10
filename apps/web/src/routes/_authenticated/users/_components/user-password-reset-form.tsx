import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import type { TUser } from "@app/schemas";
import type { ReactElement } from "react";
import { useUserPasswordResetForm } from "#/routes/_authenticated/users/_hooks/use-user-password-reset-form.ts";

type TUserPasswordResetFormProps = {
	user: TUser;
};

export const UserPasswordResetForm = ({
	user,
}: TUserPasswordResetFormProps): ReactElement => {
	const { form, onSubmit, isPending } = useUserPasswordResetForm(user);

	return (
		<form
			onSubmit={onSubmit}
			className="flex max-w-md flex-col gap-4 border border-neutral-200 p-4"
		>
			<div className="flex flex-col gap-1">
				<h2 className="font-medium">Reset password</h2>
				<p className="text-sm text-neutral-500">
					Sets a new password for {user.email} and signs them out everywhere.
					Share it with them out of band.
				</p>
			</div>
			<form.Field name="password">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor="reset-password">New password</Label>
						<Input
							id="reset-password"
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
			<Button
				type="submit"
				variant="outline"
				disabled={isPending}
				className="self-start"
			>
				{isPending ? "Resetting…" : "Reset password"}
			</Button>
		</form>
	);
};
