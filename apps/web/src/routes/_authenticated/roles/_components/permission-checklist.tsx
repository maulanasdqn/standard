import { Checkbox } from "@app/components/ui/checkbox";
import { PERMISSION_LABEL, type TPermission } from "@app/permissions";
import { A } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import { PERMISSION_GROUPS } from "#/routes/_authenticated/roles/_constants/permission-groups.ts";
import { permissionsToggle } from "#/routes/_authenticated/roles/_utils/permissions-toggle.ts";

type TPermissionChecklistProps = {
	value: readonly TPermission[];
	onChange: (next: readonly TPermission[]) => void;
	disabled?: boolean;
};

export const PermissionChecklist = ({
	value,
	onChange,
	disabled = false,
}: TPermissionChecklistProps): ReactElement => (
	<div className="grid gap-4 sm:grid-cols-2">
		{A.map(PERMISSION_GROUPS, (group) => (
			<fieldset
				key={group.resource}
				className="flex flex-col gap-2 border border-neutral-200 p-3"
				disabled={disabled}
			>
				<legend className="px-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
					{group.resource}
				</legend>
				{A.map(group.permissions, (permission) => (
					<label
						key={permission}
						htmlFor={`permission-${permission}`}
						className="flex items-center gap-2 text-sm"
					>
						<Checkbox
							id={`permission-${permission}`}
							checked={A.includes(value, permission)}
							onChange={(event) =>
								onChange(
									permissionsToggle(value, permission, event.target.checked),
								)
							}
						/>
						<span>{PERMISSION_LABEL[permission]}</span>
						<code className="ml-auto text-xs text-neutral-400">
							{permission}
						</code>
					</label>
				))}
			</fieldset>
		))}
	</div>
);
