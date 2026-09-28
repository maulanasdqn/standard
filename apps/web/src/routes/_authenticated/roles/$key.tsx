import { Guard } from "@app/components/guard/guard";
import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { useRoleReadOnly } from "#/routes/_authenticated/roles/_hooks/use-role-read-only.ts";
import { RoleEditForm } from "#/routes/_authenticated/roles/_components/role-edit-form.tsx";
import {
	roleGetOptions,
	useRoleGet,
} from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { FormPageSkeleton } from "#/routes/_components/form-page-skeleton.tsx";

const RoleEditPage: FC = (): ReactElement => {
	const { data } = useRoleGet();
	const isReadOnly = useRoleReadOnly(data);

	return (
		<FormPage
			parentLabel={ROLE_MESSAGE.TITLE}
			parentTo="/roles"
			backLabel={ROLE_MESSAGE.BACK_TO_ROLES}
			title={data.label}
			description={
				isReadOnly
					? ROLE_MESSAGE.VIEW_DESCRIPTION
					: ROLE_MESSAGE.EDIT_DESCRIPTION
			}
			meta={
				<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
					<div className="flex gap-1">
						<dt>{ROLE_MESSAGE.FIELD_KEY}</dt>
						<dd>
							<code>{data.key}</code>
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>{ROLE_MESSAGE.COLUMN_MEMBERS}</dt>
						<dd>{data.memberCount}</dd>
					</div>
				</dl>
			}
		>
			<Guard permissions={[PERMISSION.ROLE_READ]}>
				<RoleEditForm key={data.key} role={data} />
			</Guard>
		</FormPage>
	);
};

const RoleEditPending: FC = (): ReactElement => (
	<FormPageSkeleton>
		<FormSkeleton fields={1} textArea />
	</FormPageSkeleton>
);

export const Route = createFileRoute("/_authenticated/roles/$key")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.ROLE_READ] }),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(roleGetOptions(params.key)),
	component: RoleEditPage,
	pendingComponent: RoleEditPending,
});
