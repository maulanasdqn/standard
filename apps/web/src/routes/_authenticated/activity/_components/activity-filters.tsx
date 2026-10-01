import { ACTIVITY_MESSAGE, TABLE_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { DateRangeFields } from "#/routes/_authenticated/_components/date-range-fields.tsx";
import { FilterPanel } from "#/routes/_authenticated/_components/filter-panel.tsx";
import { FilterSelect } from "#/routes/_authenticated/_components/filter-select.tsx";
import {
	ACTIVITY_ACTION_OPTIONS,
	ACTIVITY_ENTITY_OPTIONS,
	useActivityFilters,
} from "#/routes/_authenticated/activity/_hooks/use-activity-filters.ts";

const FIELD_ID = {
	ACTION: "activity-action",
	ENTITY: "activity-resource-type",
	DATE: "activity-date",
} as const;

export const ActivityFilters: FC = (): ReactElement => {
	const filters = useActivityFilters();

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
				id={FIELD_ID.ACTION}
				label={ACTIVITY_MESSAGE.FILTER_ACTION}
				value={filters.draft.action}
				options={ACTIVITY_ACTION_OPTIONS}
				onChange={(action) => filters.onDraftChange({ action })}
			/>
			<FilterSelect
				id={FIELD_ID.ENTITY}
				label={ACTIVITY_MESSAGE.FILTER_ENTITY}
				value={filters.draft.resourceType}
				options={ACTIVITY_ENTITY_OPTIONS}
				onChange={(resourceType) => filters.onDraftChange({ resourceType })}
			/>
			<DateRangeFields
				idPrefix={FIELD_ID.DATE}
				label={TABLE_MESSAGE.FILTER_DATE}
				range={filters.draft}
				onChange={filters.onDraftChange}
			/>
		</FilterPanel>
	);
};
