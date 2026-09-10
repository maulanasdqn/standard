import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Select } from "@app/components/ui/select";
import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useUserEditForm } from "#/routes/_authenticated/users/_hooks/use-user-edit-form.ts";

type TUserEditFormProps = {
	user: TUser;
	roleOptions: readonly TRoleOption[];
};

export const UserEditForm = ({
	user,
	roleOptions,
}: TUserEditFormProps): ReactElement => {
	const { form, onSubmit, isPending, isSelf } = useUserEditForm(user);

	return (
		<form
			onSubmit={onSubmit}
			className="flex max-w-md flex-col gap-4 border border-neutral-200 p-4"
		>
			<p className="text-sm text-neutral-500">{user.email}</p>
			<form.Field name="name">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Name</Label>
						<Input
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="role">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Role</Label>
						<Select
							id={field.name}
							value={field.state.value}
							disabled={isSelf}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						>
							{A.map(roleOptions, (option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
						{isSelf ? (
							<p className="text-xs text-neutral-500">
								You can't change your own role.
							</p>
						) : null}
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : "Save changes"}
				</Button>
				<Link to="/users" className="text-sm hover:underline">
					Cancel
				</Link>
			</div>
		</form>
	);
};
