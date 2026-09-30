import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@app/components/ui/popover";
import { TABLE_MESSAGE } from "@app/messages";
import { SlidersHorizontal, X } from "lucide-react";
import type { FC, ReactElement } from "react";
import { NoteFilterFields } from "#/routes/_authenticated/notes/_components/note-filter-fields.tsx";
import { useNoteFilters } from "#/routes/_authenticated/notes/_hooks/use-note-filters.ts";

export const NoteFilters: FC = (): ReactElement => {
	const filters = useNoteFilters();

	return (
		<div className="flex items-center gap-1">
			<Popover open={filters.open} onOpenChange={filters.onOpenChange}>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm">
						<SlidersHorizontal />
						{TABLE_MESSAGE.FILTERS}
						{filters.activeCount > 0 && (
							<Badge className="h-5 min-w-5 rounded-full px-1.5 tabular-nums">
								{filters.activeCount}
							</Badge>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-80">
					<form
						className="grid gap-4"
						onSubmit={(event) => {
							event.preventDefault();
							filters.onApply();
						}}
					>
						<NoteFilterFields
							values={filters.draft}
							onChange={filters.onDraftChange}
						/>
						<div className="flex justify-between gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={filters.onReset}
							>
								{TABLE_MESSAGE.FILTER_RESET}
							</Button>
							<Button type="submit" size="sm">
								{TABLE_MESSAGE.FILTER_APPLY}
							</Button>
						</div>
					</form>
				</PopoverContent>
			</Popover>
			{filters.activeCount > 0 && (
				<Button variant="ghost" size="sm" onClick={filters.onClear}>
					<X />
					{TABLE_MESSAGE.FILTER_CLEAR}
				</Button>
			)}
		</div>
	);
};
