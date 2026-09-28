import { Guard } from "@app/components/guard/guard";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import { Button } from "@app/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Eye, Pencil } from "lucide-react";
import type { FC, ReactElement } from "react";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { RowAction } from "#/routes/_authenticated/_components/row-action.tsx";
import { useRoleReadOnly } from "#/routes/_authenticated/roles/_hooks/use-role-read-only.ts";
import { useRoleDelete } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { roleDeletable } from "#/routes/_authenticated/roles/_utils/role-deletable.ts";

type TRoleActionsCellProps = {
	role: TRoleDto;
};

export const RoleActionsCell: FC<TRoleActionsCellProps> = (
	props,
): ReactElement => {
	const roleDelete = useRoleDelete();
	const isReadOnly = useRoleReadOnly(props.role);
	const openLabel = isReadOnly
		? ROLE_MESSAGE.ACTION_VIEW
		: ROLE_MESSAGE.ACTION_EDIT;

	return (
		<>
			<RowAction label={openLabel}>
				<Button variant="ghost" size="icon-sm" asChild>
					<Link
						to="/roles/$key"
						params={{ key: props.role.key }}
						aria-label={openLabel}
					>
						{isReadOnly ? <Eye /> : <Pencil />}
					</Link>
				</Button>
			</RowAction>
			{roleDeletable(props.role) && (
				<Guard permissions={[PERMISSION.ROLE_DELETE]}>
					<DeleteConfirm
						title={ROLE_MESSAGE.DELETE_CONFIRM_TITLE}
						description={ROLE_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
						disabled={roleDelete.isPending}
						onConfirm={() => roleDelete.mutate({ key: props.role.key })}
					/>
				</Guard>
			)}
		</>
	);
};
