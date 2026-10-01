import { Guard } from "@app/components/guard/guard";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { formatDateTime } from "@app/format";
import { USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserEditForm } from "#/routes/_authenticated/users/_components/user-edit-form.tsx";
import { UserAccessCard } from "#/routes/_authenticated/users/_components/user-access-card.tsx";
import { UserTwoFactorCard } from "#/routes/_authenticated/users/_components/user-two-factor-card.tsx";
import { UserSessionsCard } from "#/routes/_authenticated/users/_components/user-sessions-card.tsx";
import { UserPasswordResetForm } from "#/routes/_authenticated/users/_components/user-password-reset-form.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import {
	userGetOptions,
	useIsSelf,
	useUserGet,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";
import { FormPageSkeleton } from "#/routes/_components/form-page-skeleton.tsx";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";

const UserEditPage: FC = (): ReactElement => {
	const { data } = useUserGet();
	const roleOptions = useRoleOptions();
	const isSelf = useIsSelf();

	return (
		<FormPage
			parentLabel={USER_MESSAGE.TITLE}
			parentTo="/users"
			backLabel={USER_MESSAGE.BACK_TO_USERS}
			title={USER_MESSAGE.EDIT_USER}
			description={USER_MESSAGE.EDIT_DESCRIPTION}
			meta={
				<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
					<div className="flex gap-1">
						<dt>{USER_MESSAGE.COLUMN_EMAIL}</dt>
						<dd>{data.email}</dd>
					</div>
					<div className="flex gap-1">
						<dt>{USER_MESSAGE.COLUMN_CREATED}</dt>
						<dd>{formatDateTime(data.createdAt)}</dd>
					</div>
				</dl>
			}
		>
			<div className="flex flex-col gap-6">
				<Guard permissions={[PERMISSION.USER_UPDATE]}>
					<UserEditForm user={data} roleOptions={roleOptions} />
				</Guard>
				{!isSelf(data.id) && (
					<Guard permissions={[PERMISSION.USER_UPDATE]}>
						<UserPasswordResetForm user={data} />
						<UserAccessCard user={data} />
						<UserTwoFactorCard user={data} />
						<UserSessionsCard userId={data.id} />
					</Guard>
				)}
			</div>
		</FormPage>
	);
};

const UserEditPending: FC = (): ReactElement => (
	<FormPageSkeleton>
		<FormSkeleton fields={4} twoColumn />
		<FormSkeleton fields={2} twoColumn />
	</FormPageSkeleton>
);

export const Route = createFileRoute("/_authenticated/users/$userId")({
	beforeLoad: checkRoutePermissions({
		permissions: [
			PERMISSION.USER_READ,
			PERMISSION.USER_UPDATE,
			PERMISSION.ROLE_READ,
		],
	}),
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userGetOptions(params.userId)),
			context.queryClient.ensureQueryData(roleListOptions()),
		]),
	component: UserEditPage,
	pendingComponent: UserEditPending,
});
