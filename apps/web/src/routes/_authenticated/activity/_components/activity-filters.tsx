import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from "@app/activity";
import { Label } from "@app/components/ui/label";
import { Select } from "@app/components/ui/select";
import { A, D } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import { useActivityFilters } from "#/routes/_authenticated/activity/_hooks/use-activity.ts";

const ACTIONS = D.values(ACTIVITY_ACTION);
const ENTITY_TYPES = D.values(ACTIVITY_ENTITY_TYPE);

export const ActivityFilters = (): ReactElement => {
	const { action, entityType, onActionChange, onEntityTypeChange } =
		useActivityFilters();

	return (
		<div className="flex flex-wrap gap-4">
			<div className="flex flex-col gap-1">
				<Label htmlFor="activity-action">Action</Label>
				<Select
					id="activity-action"
					value={action}
					onChange={(event) => onActionChange(event.target.value)}
					className="w-48"
				>
					<option value="">All actions</option>
					{A.map(ACTIONS, (value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</Select>
			</div>
			<div className="flex flex-col gap-1">
				<Label htmlFor="activity-entity-type">Entity</Label>
				<Select
					id="activity-entity-type"
					value={entityType}
					onChange={(event) => onEntityTypeChange(event.target.value)}
					className="w-48"
				>
					<option value="">All entities</option>
					{A.map(ENTITY_TYPES, (value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</Select>
			</div>
		</div>
	);
};
