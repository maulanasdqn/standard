import type { FC, ReactElement } from "react";
import { FilterPanel } from "#/routes/_authenticated/_components/filter-panel.tsx";
import { NoteFilterFields } from "#/routes/_authenticated/notes/_components/note-filter-fields.tsx";
import { useNoteFilters } from "#/routes/_authenticated/notes/_hooks/use-note-filters.ts";

export const NoteFilters: FC = (): ReactElement => {
	const filters = useNoteFilters();

	return (
		<FilterPanel
			activeCount={filters.activeCount}
			open={filters.open}
			onOpenChange={filters.onOpenChange}
			onApply={filters.onApply}
			onReset={filters.onReset}
			onClear={filters.onClear}
		>
			<NoteFilterFields
				values={filters.draft}
				onChange={filters.onDraftChange}
			/>
		</FilterPanel>
	);
};
