import { ROLE_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { FilterPanel } from "#/routes/_authenticated/_components/filter-panel.tsx";
import { FilterSelect } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	ROLE_MEMBERS_OPTIONS,
	ROLE_TYPE_OPTIONS,
	useRoleFilters,
} from "#/routes/_authenticated/roles/_hooks/use-role-filters.ts";
import {
	roleMembersFilterOf,
	roleTypeFilterOf,
} from "#/routes/_authenticated/roles/_utils/role-filter.ts";

const FIELD_ID = {
	TYPE: "role-filter-type",
	MEMBERS: "role-filter-members",
} as const;

export const RoleFilters: FC = (): ReactElement => {
	const filters = useRoleFilters();

	return (
		<FilterPanel
			activeCount={filters.activeCount}
			open={filters.open}
			onOpenChange={filters.onOpenChange}
			onApply={filters.onApply}
			onReset={filters.onReset}
			onClear={filters.onClear}
		>
			<FilterSelect
				id={FIELD_ID.TYPE}
				label={ROLE_MESSAGE.FILTER_TYPE}
				value={filters.draft.type}
				options={ROLE_TYPE_OPTIONS}
				onChange={(value) =>
					filters.onDraftChange({ type: roleTypeFilterOf(value) })
				}
			/>
			<FilterSelect
				id={FIELD_ID.MEMBERS}
				label={ROLE_MESSAGE.FILTER_MEMBERS}
				value={filters.draft.members}
				options={ROLE_MEMBERS_OPTIONS}
				onChange={(value) =>
					filters.onDraftChange({ members: roleMembersFilterOf(value) })
				}
			/>
		</FilterPanel>
	);
};
