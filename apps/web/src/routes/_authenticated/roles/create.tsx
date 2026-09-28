import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { RoleCreateForm } from "#/routes/_authenticated/roles/_components/role-create-form.tsx";
import { FormPageSkeleton } from "#/routes/_components/form-page-skeleton.tsx";

const RoleCreatePage: FC = (): ReactElement => (
	<FormPage
		parentLabel={ROLE_MESSAGE.TITLE}
		parentTo="/roles"
		backLabel={ROLE_MESSAGE.BACK_TO_ROLES}
		title={ROLE_MESSAGE.NEW_ROLE}
		description={ROLE_MESSAGE.CREATE_DESCRIPTION}
	>
		<RoleCreateForm />
	</FormPage>
);

const RoleCreatePending: FC = (): ReactElement => (
	<FormPageSkeleton>
		<FormSkeleton fields={2} twoColumn textArea />
	</FormPageSkeleton>
);

export const Route = createFileRoute("/_authenticated/roles/create")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.ROLE_CREATE] }),
	component: RoleCreatePage,
	pendingComponent: RoleCreatePending,
});
