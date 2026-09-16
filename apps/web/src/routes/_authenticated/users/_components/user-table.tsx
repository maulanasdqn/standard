import { Guard } from "@app/components/guard/guard";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatDateTime } from "@app/format";
import { USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TUser, TUserUpdateInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	useIsSelf,
	useUserDelete,
	useUserUpdate,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

const roleLabelOf = (options: readonly TRoleOption[], value: string): string =>
	A.find(options, (option) => option.value === value)?.label ?? value;

type TUserTableProps = {
	users: readonly TUser[];
	roleOptions: readonly TRoleOption[];
};

export const UserTable: FC<TUserTableProps> = (props): ReactElement => {
	const userUpdate = useUserUpdate();
	const userDelete = useUserDelete();
	const isSelf = useIsSelf();
	const roleChange = useConfirmedAction<TUserUpdateInput>((input) =>
		userUpdate.mutate(input),
	);

	return match(A.isEmpty(props.users))
		.with(true, () => <EmptyState message={USER_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{A.map(props.users, (user) => (
							<TableRow key={user.id}>
								<TableCell className="font-medium">{user.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{user.email}
								</TableCell>
								<TableCell>
									<Guard
										permissions={[PERMISSION.USER_MANAGE]}
										fallback={
											<span className="text-sm">
												{roleLabelOf(props.roleOptions, user.role)}
											</span>
										}
									>
										<Select
											value={user.role}
											disabled={isSelf(user.id) || userUpdate.isPending}
											onValueChange={(role) =>
												roleChange.request({ id: user.id, role })
											}
										>
											<SelectTrigger
												aria-label={`Role for ${user.name}`}
												className="w-40"
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
									</Guard>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDateTime(user.createdAt)}
								</TableCell>
								<TableCell className="text-right">
									<Link
										to="/users/$userId"
										params={{ userId: user.id }}
										className="px-3 py-1 text-sm hover:underline"
									>
										Edit
									</Link>
									<Guard permissions={[PERMISSION.USER_MANAGE]}>
										<DeleteConfirm
											title={USER_MESSAGE.DELETE_CONFIRM_TITLE}
											description={USER_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
											disabled={isSelf(user.id) || userDelete.isPending}
											onConfirm={() => userDelete.mutate({ id: user.id })}
										/>
									</Guard>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<ConfirmDialog
					open={roleChange.open}
					title={USER_MESSAGE.ROLE_CHANGE_CONFIRM_TITLE}
					description={USER_MESSAGE.ROLE_CHANGE_CONFIRM_DESCRIPTION}
					onOpenChange={roleChange.onOpenChange}
					onConfirm={roleChange.onConfirm}
				/>
			</>
		));
};
