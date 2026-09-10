import { Button } from "@app/components/ui/button";
import { Select } from "@app/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatDateTime } from "@app/format";
import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { match } from "ts-pattern";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	useIsSelf,
	useUserDelete,
	useUserUpdate,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

type TUserTableProps = {
	users: readonly TUser[];
	roleOptions: readonly TRoleOption[];
};

export const UserTable = ({
	users,
	roleOptions,
}: TUserTableProps): ReactElement => {
	const userUpdate = useUserUpdate();
	const userDelete = useUserDelete();
	const isSelf = useIsSelf();

	return match(A.isEmpty(users))
		.with(true, () => <p className="text-sm text-neutral-500">No users yet.</p>)
		.otherwise(() => (
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
					{A.map(users, (user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell className="text-neutral-600">{user.email}</TableCell>
							<TableCell>
								<Select
									aria-label={`Role for ${user.name}`}
									value={user.role}
									disabled={isSelf(user.id) || userUpdate.isPending}
									onChange={(event) =>
										userUpdate.mutate({ id: user.id, role: event.target.value })
									}
									className="w-40"
								>
									{A.map(roleOptions, (option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
							</TableCell>
							<TableCell className="text-neutral-500">
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
								<Button
									variant="ghost"
									size="sm"
									disabled={isSelf(user.id) || userDelete.isPending}
									onClick={() => userDelete.mutate({ id: user.id })}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		));
};
