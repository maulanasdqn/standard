import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import type { TRoleDto } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { PermissionChecklist } from "#/routes/_authenticated/roles/_components/permission-checklist.tsx";
import { useRoleEditForm } from "#/routes/_authenticated/roles/_hooks/use-role-edit-form.ts";
import { Card, CardContent } from "@app/components/ui/card";
import { ROLE_MESSAGE } from "@app/messages";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";

type TRoleEditFormProps = {
	role: TRoleDto;
};

export const RoleEditForm: FC<TRoleEditFormProps> = (props): ReactElement => {
	const { form, onSubmit, confirm, isPending, isFixed } = useRoleEditForm(
		props.role,
	);

	return (
		<Card>
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<p className="text-sm text-muted-foreground">
						Key: <code>{props.role.key}</code> · {props.role.memberCount}{" "}
						members
					</p>
					{isFixed && (
						<p className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
							Fixed roles are defined in code and can't be changed here.
						</p>
					)}
					<form.Field name="label">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>Label</Label>
								<Input
									id={field.name}
									placeholder={ROLE_MESSAGE.LABEL_PLACEHOLDER}
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
									placeholder={ROLE_MESSAGE.DESCRIPTION_PLACEHOLDER}
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
						{!isFixed && (
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving…" : "Save changes"}
							</Button>
						)}
						<Link to="/roles" className="text-sm hover:underline">
							Back to roles
						</Link>
					</div>
				</form>
				<ConfirmDialog
					open={confirm.open}
					title={ROLE_MESSAGE.UPDATE_CONFIRM_TITLE}
					description={ROLE_MESSAGE.UPDATE_CONFIRM_DESCRIPTION}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
