import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import type { TRoleOption } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";

const roleLabelOf = (options: readonly TRoleOption[], value: string): string =>
	A.find(options, (option) => option.value === value)?.label ?? value;

type TUserRoleCellProps = {
	user: TUser;
	roleOptions: readonly TRoleOption[];
};

export const UserRoleCell: FC<TUserRoleCellProps> = (props): ReactElement => (
	<span className="text-sm">
		{roleLabelOf(props.roleOptions, props.user.role)}
	</span>
);
