import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Select } from "@app/components/ui/select";
import { A } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useUserCreateForm } from "#/routes/_authenticated/users/_hooks/use-user-create-form.ts";

type TUserCreateFormProps = {
	roleOptions: readonly TRoleOption[];
};

export const UserCreateForm = ({
	roleOptions,
}: TUserCreateFormProps): ReactElement => {
	const { form, onSubmit, isPending } = useUserCreateForm();

	return (
		<form
			onSubmit={onSubmit}
			className="grid gap-3 border border-neutral-200 p-4 sm:grid-cols-2"
		>
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
			<form.Field name="email">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Email</Label>
						<Input
							id={field.name}
							type="email"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="password">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Password</Label>
						<Input
							id={field.name}
							type="password"
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
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						>
							{A.map(roleOptions, (option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<Button
				type="submit"
				disabled={isPending}
				className="self-end sm:col-span-2 sm:justify-self-start"
			>
				{isPending ? "Creating…" : "Create user"}
			</Button>
		</form>
	);
};
