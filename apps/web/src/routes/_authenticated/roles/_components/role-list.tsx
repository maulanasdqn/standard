import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { orDash } from "@app/format";
import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { match } from "ts-pattern";
import { useRoleDelete } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { roleDeletable } from "#/routes/_authenticated/roles/_utils/role-deletable.ts";

type TRoleListProps = {
	roles: readonly TRoleDto[];
};

export const RoleList = ({ roles }: TRoleListProps): ReactElement => {
	const roleDelete = useRoleDelete();

	return match(A.isEmpty(roles))
		.with(true, () => <p className="text-sm text-neutral-500">No roles yet.</p>)
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
					{A.map(roles, (role) => (
						<TableRow key={role.key}>
							<TableCell>
								<span className="flex items-center gap-2 font-medium">
									{role.label}
									{role.fixed ? <Badge variant="outline">Fixed</Badge> : null}
								</span>
							</TableCell>
							<TableCell>
								<code className="text-xs">{role.key}</code>
							</TableCell>
							<TableCell className="text-neutral-600">
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
								{roleDeletable(role) ? (
									<Button
										variant="ghost"
										size="sm"
										disabled={roleDelete.isPending}
										onClick={() => roleDelete.mutate({ key: role.key })}
									>
										Delete
									</Button>
								) : null}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		));
};
