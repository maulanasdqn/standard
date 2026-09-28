import { Guard } from "@app/components/guard/guard";
import { USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TUser } from "@app/schemas";
import { Button } from "@app/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import type { FC, ReactElement } from "react";
import { DeleteConfirm } from "#/routes/_authenticated/_components/delete-confirm.tsx";
import { RowAction } from "#/routes/_authenticated/_components/row-action.tsx";
import { useUserDelete } from "#/routes/_authenticated/users/_hooks/use-users.ts";

type TUserActionsCellProps = {
	user: TUser;
	isSelf: boolean;
};

export const UserActionsCell: FC<TUserActionsCellProps> = (
	props,
): ReactElement => {
	const userDelete = useUserDelete();

	return (
		<>
			<Guard permissions={[PERMISSION.USER_UPDATE]}>
				<RowAction label={USER_MESSAGE.ACTION_EDIT}>
					<Button variant="ghost" size="icon-sm" asChild>
						<Link
							to="/users/$userId"
							params={{ userId: props.user.id }}
							aria-label={USER_MESSAGE.ACTION_EDIT}
						>
							<Pencil />
						</Link>
					</Button>
				</RowAction>
			</Guard>
			<Guard permissions={[PERMISSION.USER_DELETE]}>
				<DeleteConfirm
					title={USER_MESSAGE.DELETE_CONFIRM_TITLE}
					description={USER_MESSAGE.DELETE_CONFIRM_DESCRIPTION}
					disabled={props.isSelf || userDelete.isPending}
					onConfirm={() => userDelete.mutate({ id: props.user.id })}
				/>
			</Guard>
		</>
	);
};
