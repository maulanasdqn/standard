import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { match } from "ts-pattern";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserEditForm } from "#/routes/_authenticated/users/_components/user-edit-form.tsx";
import { UserPasswordResetForm } from "#/routes/_authenticated/users/_components/user-password-reset-form.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	userGetOptions,
	useIsSelf,
	useUserGet,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

const UserEditPage: FC = (): ReactElement => {
	const { data } = useUserGet();
	const roleOptions = useRoleOptions();
	const isSelf = useIsSelf();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-xl font-semibold">Edit user</h1>
			<UserEditForm user={data} roleOptions={roleOptions} />
			{match(isSelf(data.id))
				.with(true, () => null)
				.otherwise(() => (
					<UserPasswordResetForm user={data} />
				))}
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/users/$userId")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.USER_MANAGE] }),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userGetOptions(params.userId)),
			context.queryClient.ensureQueryData(roleListOptions()),
		]),
	component: UserEditPage,
});
