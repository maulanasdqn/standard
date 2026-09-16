import { Guard } from "@app/components/guard/guard";
import { Badge } from "@app/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { orDash } from "@app/format";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";
import { useRoleDelete } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { roleDeletable } from "#/routes/_authenticated/roles/_utils/role-deletable.ts";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";

type TRoleListProps = {
	roles: readonly TRoleDto[];
};

export const RoleList: FC<TRoleListProps> = (props): ReactElement => {
	const roleDelete = useRoleDelete();

	return match(A.isEmpty(props.roles))
		.with(true, () => <EmptyState message={ROLE_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Role</TableHead>
						<TableHead>Key</TableHead>
						<TableHead>Description</TableHead>
						<TableHead className="text-right">Permissions</TableHead>
						<TableHead className="text-right">Members</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{A.map(props.roles, (role) => (
						<TableRow key={role.key}>
							<TableCell>
								<span className="flex items-center gap-2 font-medium">
									{role.label}
									{role.fixed && <Badge variant="outline">Fixed</Badge>}
								</span>
							</TableCell>
							<TableCell>
								<code className="text-xs">{role.key}</code>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{orDash(role.description)}
							</TableCell>
							<TableCell className="text-right">
								{A.length(role.permissions)}
							</TableCell>
							<TableCell className="text-right">{role.memberCount}</TableCell>
							<TableCell className="text-right">
								<Link
									to="/roles/$key"
									params={{ key: role.key }}
									className="px-3 py-1 text-sm hover:underline"
								>
									{role.fixed ? "View" : "Edit"}
								</Link>
								{roleDeletable(role) && (
									<Guard permissions={[PERMISSION.USER_MANAGE]}>
										<DeleteConfirm
											title={ROLE_MESSAGE.DELETE_CONFIRM_TITLE}
											description={ROLE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
											disabled={roleDelete.isPending}
											onConfirm={() => roleDelete.mutate({ key: role.key })}
										/>
									</Guard>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		));
};
