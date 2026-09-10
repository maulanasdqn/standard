import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import type { TRoleDto } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { PermissionChecklist } from "#/routes/_authenticated/roles/_components/permission-checklist.tsx";
import { useRoleEditForm } from "#/routes/_authenticated/roles/_hooks/use-role-edit-form.ts";

type TRoleEditFormProps = {
	role: TRoleDto;
};

export const RoleEditForm = ({ role }: TRoleEditFormProps): ReactElement => {
	const { form, onSubmit, isPending, isFixed } = useRoleEditForm(role);

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-4 border border-neutral-200 p-4"
		>
			<p className="text-sm text-neutral-500">
				Key: <code>{role.key}</code> · {role.memberCount} members
			</p>
			{isFixed ? (
				<p className="border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
					Fixed roles are defined in code and can't be changed here.
				</p>
			) : null}
			<form.Field name="label">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Label</Label>
						<Input
							id={field.name}
							value={field.state.value}
							disabled={isFixed}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="description">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Description</Label>
						<Textarea
							id={field.name}
							value={field.state.value ?? ""}
							disabled={isFixed}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="permissions">
				{(field) => (
					<div className="flex flex-col gap-2">
						<span className="text-sm font-medium">Permissions</span>
						<PermissionChecklist
							value={field.state.value}
							disabled={isFixed}
							onChange={(next) => field.handleChange([...next])}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<div className="flex items-center gap-3">
				{isFixed ? null : (
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving…" : "Save changes"}
					</Button>
				)}
				<Link to="/roles" className="text-sm hover:underline">
					Back to roles
				</Link>
			</div>
		</form>
	);
};
