import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import type { ReactElement } from "react";
import { PermissionChecklist } from "#/routes/_authenticated/roles/_components/permission-checklist.tsx";
import { useRoleCreateForm } from "#/routes/_authenticated/roles/_hooks/use-role-create-form.ts";

export const RoleCreateForm = (): ReactElement => {
	const { form, onSubmit, isPending } = useRoleCreateForm();

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-4 border border-neutral-200 p-4"
		>
			<div className="grid gap-3 sm:grid-cols-2">
				<form.Field name="key">
					{(field) => (
						<div className="flex flex-col gap-1">
							<Label htmlFor={field.name}>Key</Label>
							<Input
								id={field.name}
								placeholder="reviewer"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
							<FieldError errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>
				<form.Field name="label">
					{(field) => (
						<div className="flex flex-col gap-1">
							<Label htmlFor={field.name}>Label</Label>
							<Input
								id={field.name}
								placeholder="Reviewer"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
							<FieldError errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>
			</div>
			<form.Field name="description">
				{(field) => (
					<div className="flex flex-col gap-1">
						<Label htmlFor={field.name}>Description</Label>
						<Textarea
							id={field.name}
							value={field.state.value ?? ""}
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
							value={field.state.value ?? []}
							onChange={(next) => field.handleChange([...next])}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<Button type="submit" disabled={isPending} className="self-start">
				{isPending ? "Creating…" : "Create role"}
			</Button>
		</form>
	);
};
