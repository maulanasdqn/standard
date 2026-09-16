import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { useUserEditForm } from "#/routes/_authenticated/users/_hooks/use-user-edit-form.ts";
import { Card, CardContent } from "@app/components/ui/card";
import { USER_MESSAGE } from "@app/messages";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";

type TUserEditFormProps = {
	user: TUser;
	roleOptions: readonly TRoleOption[];
};

export const UserEditForm: FC<TUserEditFormProps> = (props): ReactElement => {
	const { form, onSubmit, confirm, isPending, isSelf } = useUserEditForm(
		props.user,
	);

	return (
		<Card className="max-w-md">
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<p className="text-sm text-muted-foreground">{props.user.email}</p>
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
									value={field.state.value}
									disabled={isSelf}
									onValueChange={field.handleChange}
								>
									<SelectTrigger
										id={field.name}
										className="w-full"
										onBlur={field.handleBlur}
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{A.map(props.roleOptions, (option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isSelf && (
									<p className="text-xs text-muted-foreground">
										You can't change your own role.
									</p>
								)}
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
				<ConfirmDialog
					open={confirm.open}
					title={USER_MESSAGE.UPDATE_CONFIRM_TITLE}
					description={USER_MESSAGE.UPDATE_CONFIRM_DESCRIPTION}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
