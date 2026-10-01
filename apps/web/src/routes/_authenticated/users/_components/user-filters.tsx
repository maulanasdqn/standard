import { USER_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DateRangeFields } from "#/routes/_authenticated/_components/date-range-fields.tsx";
import { FilterPanel } from "#/routes/_authenticated/_components/filter-panel.tsx";
import { FilterSelect } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	USER_STATUS_OPTIONS,
	USER_TWO_FACTOR_OPTIONS,
	userStatusFilterOf,
	userTwoFactorFilterOf,
	useUserFilters,
} from "#/routes/_authenticated/users/_hooks/use-user-filters.ts";

const FIELD_ID = {
	ROLE: "user-filter-role",
	STATUS: "user-filter-status",
	TWO_FACTOR: "user-filter-two-factor",
	CREATED: "user-filter-created",
} as const;

export const UserFilters: FC = (): ReactElement => {
	const filters = useUserFilters();

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
				id={FIELD_ID.ROLE}
				label={USER_MESSAGE.FILTER_ROLE}
				value={filters.draft.role}
				options={filters.roleOptions}
				onChange={(role) => filters.onDraftChange({ role })}
			/>
			<FilterSelect
				id={FIELD_ID.STATUS}
				label={USER_MESSAGE.FILTER_STATUS}
				value={filters.draft.status}
				options={USER_STATUS_OPTIONS}
				onChange={(value) =>
					filters.onDraftChange({ status: userStatusFilterOf(value) })
				}
			/>
			<FilterSelect
				id={FIELD_ID.TWO_FACTOR}
				label={USER_MESSAGE.FILTER_TWO_FACTOR}
				value={filters.draft.twoFactor}
				options={USER_TWO_FACTOR_OPTIONS}
				onChange={(value) =>
					filters.onDraftChange({ twoFactor: userTwoFactorFilterOf(value) })
				}
			/>
			<DateRangeFields
				idPrefix={FIELD_ID.CREATED}
				label={USER_MESSAGE.FILTER_CREATED}
				range={filters.draft}
				onChange={filters.onDraftChange}
			/>
		</FilterPanel>
	);
};
