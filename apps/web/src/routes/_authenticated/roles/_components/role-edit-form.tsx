import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Field } from "@app/components/ui/field";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import { APP_MESSAGE, ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import { Loader2, Pencil } from "lucide-react";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { PermissionChecklist } from "#/routes/_authenticated/roles/_components/permission-checklist.tsx";
import { useRoleEditForm } from "#/routes/_authenticated/roles/_hooks/use-role-edit-form.ts";

type TRoleEditFormProps = {
	role: TRoleDto;
	readOnly: boolean;
	editable: boolean;
};

export const RoleEditForm: FC<TRoleEditFormProps> = (props): ReactElement => {
	const { form, onSubmit, confirm, isPending, isFixed, isReadOnly } =
		useRoleEditForm(props.role, props.readOnly);

	return (
		<form onSubmit={onSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>{ROLE_MESSAGE.DETAILS_TITLE}</CardTitle>
					<CardDescription>
						{ROLE_MESSAGE.EDIT_DETAILS_DESCRIPTION}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					{isFixed && (
						<p className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
							{ROLE_MESSAGE.FIXED}
						</p>
					)}
					<form.Field name="label">
						{(field) => (
							<Field
								id={field.name}
								label={ROLE_MESSAGE.FIELD_LABEL}
								errors={field.state.meta.errors}
							>
								{(control): ReactElement => (
									<Input
										{...control}
										placeholder={ROLE_MESSAGE.LABEL_PLACEHOLDER}
										value={field.state.value}
										disabled={isReadOnly}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="description">
						{(field) => (
							<Field
								id={field.name}
								label={ROLE_MESSAGE.FIELD_DESCRIPTION}
								errors={field.state.meta.errors}
							>
								{(control): ReactElement => (
									<Textarea
										{...control}
										placeholder={ROLE_MESSAGE.DESCRIPTION_PLACEHOLDER}
										value={field.state.value ?? ""}
										disabled={isReadOnly}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="permissions">
						{(field) => (
							<div className="flex flex-col gap-2">
								<span className="text-sm font-medium">
									{ROLE_MESSAGE.FIELD_PERMISSIONS}
								</span>
								<PermissionChecklist
									value={field.state.value}
									disabled={isReadOnly}
									onChange={(next) => field.handleChange([...next])}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
				</CardContent>
				<CardFooter className="justify-end gap-2 border-t pt-6">
					<Button variant="outline" asChild>
						<Link to="/roles">
							{isReadOnly ? ROLE_MESSAGE.BACK_TO_ROLES : APP_MESSAGE.CANCEL}
						</Link>
					</Button>
					{isReadOnly && props.editable && (
						<Guard permissions={[PERMISSION.ROLE_UPDATE]}>
							<Button asChild>
								<Link to="/roles/$key/edit" params={{ key: props.role.key }}>
									<Pencil />
									{ROLE_MESSAGE.EDIT_ACTION}
								</Link>
							</Button>
						</Guard>
					)}
					{!isReadOnly && (
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? ROLE_MESSAGE.SAVING : ROLE_MESSAGE.SAVE_CHANGES}
						</Button>
					)}
				</CardFooter>
			</Card>
			<ConfirmDialog
				open={confirm.open}
				title={ROLE_MESSAGE.UPDATE_CONFIRM_TITLE}
				description={ROLE_MESSAGE.UPDATE_CONFIRM_DESCRIPTION}
				onOpenChange={confirm.onOpenChange}
				onConfirm={confirm.onConfirm}
			/>
		</form>
	);
};
