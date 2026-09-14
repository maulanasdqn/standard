import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import { Label } from "@app/components/ui/label";
import { Select } from "@app/components/ui/select";
import { ACTIVITY_MESSAGE } from "@app/messages";
import { A, D } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { useActivityFilters } from "#/routes/_authenticated/activity/_hooks/use-activity.ts";

const ACTIONS = D.values(ACTIVITY_ACTION);
const RESOURCE_TYPES = D.values(ACTIVITY_RESOURCE_TYPE);

export const ActivityFilters: FC = (): ReactElement => {
	const { action, resourceType, onActionChange, onResourceTypeChange } =
		useActivityFilters();

	return (
		<div className="flex flex-wrap gap-4">
			<div className="flex flex-col gap-1">
				<Label htmlFor="activity-action">
					{ACTIVITY_MESSAGE.FILTER_ACTION}
				</Label>
				<Select
					id="activity-action"
					value={action}
					onChange={(event) => onActionChange(event.target.value)}
					className="w-48"
				>
					<option value="">{ACTIVITY_MESSAGE.FILTER_ACTION_ALL}</option>
					{A.map(ACTIONS, (value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</Select>
			</div>
			<div className="flex flex-col gap-1">
				<Label htmlFor="activity-resource-type">
					{ACTIVITY_MESSAGE.FILTER_ENTITY}
				</Label>
				<Select
					id="activity-resource-type"
					value={resourceType}
					onChange={(event) => onResourceTypeChange(event.target.value)}
					className="w-48"
				>
					<option value="">{ACTIVITY_MESSAGE.FILTER_ENTITY_ALL}</option>
					{A.map(RESOURCE_TYPES, (value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</Select>
			</div>
		</div>
	);
};
