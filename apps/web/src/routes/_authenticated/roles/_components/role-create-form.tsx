import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { APP_MESSAGE, ROLE_MESSAGE } from "@app/messages";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { PermissionChecklist } from "#/routes/_authenticated/roles/_components/permission-checklist.tsx";
import { useRoleCreateForm } from "#/routes/_authenticated/roles/_hooks/use-role-create-form.ts";

export const RoleCreateForm: FC = (): ReactElement => {
	const { form, onSubmit, confirm, isPending } = useRoleCreateForm();

	return (
		<form onSubmit={onSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>{ROLE_MESSAGE.DETAILS_TITLE}</CardTitle>
					<CardDescription>
						{ROLE_MESSAGE.CREATE_DETAILS_DESCRIPTION}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<form.Field name="key">
							{(field) => (
								<div className="flex flex-col gap-2">
									<Label htmlFor={field.name}>{ROLE_MESSAGE.FIELD_KEY}</Label>
									<Input
										id={field.name}
										placeholder={ROLE_MESSAGE.KEY_PLACEHOLDER}
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
								<div className="flex flex-col gap-2">
									<Label htmlFor={field.name}>{ROLE_MESSAGE.FIELD_LABEL}</Label>
									<Input
										id={field.name}
										placeholder={ROLE_MESSAGE.LABEL_PLACEHOLDER}
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
							<div className="flex flex-col gap-2">
								<Label htmlFor={field.name}>
									{ROLE_MESSAGE.FIELD_DESCRIPTION}
								</Label>
								<Textarea
									id={field.name}
									placeholder={ROLE_MESSAGE.DESCRIPTION_PLACEHOLDER}
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
								<span className="text-sm font-medium">
									{ROLE_MESSAGE.FIELD_PERMISSIONS}
								</span>
								<PermissionChecklist
									value={field.state.value ?? []}
									onChange={(next) => field.handleChange([...next])}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
				</CardContent>
				<CardFooter className="justify-end gap-2 border-t pt-6">
					<Button variant="outline" asChild>
						<Link to="/roles">{APP_MESSAGE.CANCEL}</Link>
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending && <Loader2 className="animate-spin" />}
						{isPending ? ROLE_MESSAGE.CREATING : ROLE_MESSAGE.CREATE_ACTION}
					</Button>
				</CardFooter>
			</Card>
			<ConfirmDialog
				open={confirm.open}
				title={ROLE_MESSAGE.CREATE_CONFIRM_TITLE}
				description={ROLE_MESSAGE.CREATE_CONFIRM_DESCRIPTION}
				onOpenChange={confirm.onOpenChange}
				onConfirm={confirm.onConfirm}
			/>
		</form>
	);
};
