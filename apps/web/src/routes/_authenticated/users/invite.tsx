import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { USER_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { roleListOptions } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { UserInviteForm } from "#/routes/_authenticated/users/_components/user-invite-form.tsx";
import { useRoleOptions } from "#/routes/_authenticated/users/_hooks/use-role-options.ts";
import { FormPageSkeleton } from "#/routes/_components/form-page-skeleton.tsx";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";

const UserInvitePage: FC = (): ReactElement => {
	const roleOptions = useRoleOptions();

	return (
		<FormPage
			parentLabel={USER_MESSAGE.TITLE}
			parentTo="/users"
			title={USER_MESSAGE.INVITE_TITLE}
			description={USER_MESSAGE.INVITE_DESCRIPTION}
		>
			<UserInviteForm roleOptions={roleOptions} />
		</FormPage>
	);
};

const UserInvitePending: FC = (): ReactElement => (
	<FormPageSkeleton>
		<FormSkeleton fields={3} twoColumn />
	</FormPageSkeleton>
);

export const Route = createFileRoute("/_authenticated/users/invite")({
	beforeLoad: checkRoutePermissions({
		permissions: [PERMISSION.USER_CREATE, PERMISSION.ROLE_READ],
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(roleListOptions()),
	component: UserInvitePage,
	pendingComponent: UserInvitePending,
});
