import { Guard } from "@app/components/guard/guard";
import { ROLE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import type { TRoleDto } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";
import { RoleEditForm } from "#/routes/_authenticated/roles/_components/role-edit-form.tsx";

type TRolePageProps = {
	role: TRoleDto;
	readOnly: boolean;
	editable: boolean;
};

export const RolePage: FC<TRolePageProps> = (props): ReactElement => (
	<FormPage
		parentLabel={ROLE_MESSAGE.TITLE}
		parentTo="/roles"
		backLabel={ROLE_MESSAGE.BACK_TO_ROLES}
		title={props.role.label}
		description={
			props.readOnly
				? ROLE_MESSAGE.VIEW_DESCRIPTION
				: ROLE_MESSAGE.EDIT_DESCRIPTION
		}
		meta={
			<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
				<div className="flex gap-1">
					<dt>{ROLE_MESSAGE.FIELD_KEY}</dt>
					<dd>
						<code>{props.role.key}</code>
					</dd>
				</div>
				<div className="flex gap-1">
					<dt>{ROLE_MESSAGE.COLUMN_MEMBERS}</dt>
					<dd>{props.role.memberCount}</dd>
				</div>
			</dl>
		}
	>
		<Guard permissions={[PERMISSION.ROLE_READ]}>
			<RoleEditForm
				key={`${props.role.key}-${props.readOnly}`}
				role={props.role}
				readOnly={props.readOnly}
				editable={props.editable}
			/>
		</Guard>
	</FormPage>
);
