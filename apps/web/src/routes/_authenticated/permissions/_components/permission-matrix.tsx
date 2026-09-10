import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { ALL_PERMISSIONS, PERMISSION_LABEL } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Check } from "lucide-react";
import type { ReactElement } from "react";

type TPermissionMatrixProps = {
	roles: readonly TRoleDto[];
};

export const PermissionMatrix = ({
	roles,
}: TPermissionMatrixProps): ReactElement => (
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Permission</TableHead>
				{A.map(roles, (role) => (
					<TableHead key={role.key} className="text-center">
						{role.label}
					</TableHead>
				))}
			</TableRow>
		</TableHeader>
		<TableBody>
			{A.map(ALL_PERMISSIONS, (permission) => (
				<TableRow key={permission}>
					<TableCell>
						<span className="flex flex-col">
							<span className="font-medium">
								{PERMISSION_LABEL[permission]}
							</span>
							<code className="text-xs text-neutral-400">{permission}</code>
						</span>
					</TableCell>
					{A.map(roles, (role) => (
						<TableCell key={role.key} className="text-center">
							{A.includes(role.permissions, permission) ? (
								<Check className="mx-auto size-4" aria-label="Granted" />
							) : (
								<span className="sr-only">Not granted</span>
							)}
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	</Table>
);
