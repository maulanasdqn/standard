import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@app/components/ui/select";
import { NOTE_MESSAGE, TABLE_MESSAGE } from "@app/messages";
import { NOTE_ATTACHMENT_FILTER, NOTE_DATE_FIELD } from "@app/schemas";
import type { FC, ReactElement } from "react";
import {
	NOTE_FILTER_ANY,
	NOTE_FILTER_FIELD_ID,
} from "#/routes/_authenticated/notes/_constants/filter.ts";
import {
	toNoteAttachmentFilter,
	toNoteDateField,
} from "#/routes/_authenticated/notes/_utils/note-filter-values.ts";
import type { TNoteFilterValues } from "#/routes/_authenticated/notes/_hooks/use-note-filters.ts";

type TNoteFilterFieldsProps = {
	values: TNoteFilterValues;
	onChange: (patch: Partial<TNoteFilterValues>) => void;
};

export const NoteFilterFields: FC<TNoteFilterFieldsProps> = (
	props,
): ReactElement => (
	<div className="grid gap-4">
		<div className="grid gap-1.5">
			<Label htmlFor={NOTE_FILTER_FIELD_ID.TITLE}>
				{NOTE_MESSAGE.FILTER_TITLE}
			</Label>
			<Input
				id={NOTE_FILTER_FIELD_ID.TITLE}
				placeholder={NOTE_MESSAGE.FILTER_TITLE_PLACEHOLDER}
				value={props.values.title ?? ""}
				onChange={(event) => props.onChange({ title: event.target.value })}
			/>
		</div>
		<div className="grid gap-1.5">
			<Label htmlFor={NOTE_FILTER_FIELD_ID.DATE_FIELD}>
				{TABLE_MESSAGE.FILTER_DATE}
			</Label>
			<Select
				value={props.values.dateField ?? NOTE_DATE_FIELD.CREATED_AT}
				onValueChange={(value) =>
					props.onChange({ dateField: toNoteDateField(value) })
				}
			>
				<SelectTrigger id={NOTE_FILTER_FIELD_ID.DATE_FIELD} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={NOTE_DATE_FIELD.CREATED_AT}>
						{NOTE_MESSAGE.CREATED_AT}
					</SelectItem>
					<SelectItem value={NOTE_DATE_FIELD.UPDATED_AT}>
						{NOTE_MESSAGE.UPDATED_AT}
					</SelectItem>
				</SelectContent>
			</Select>
			<div className="grid grid-cols-2 gap-2">
				<div className="grid gap-1">
					<Label
						htmlFor={NOTE_FILTER_FIELD_ID.DATE_FROM}
						className="text-xs text-muted-foreground"
					>
						{TABLE_MESSAGE.FILTER_FROM}
					</Label>
					<Input
						id={NOTE_FILTER_FIELD_ID.DATE_FROM}
						type="date"
						max={props.values.dateTo}
						value={props.values.dateFrom ?? ""}
						onChange={(event) =>
							props.onChange({ dateFrom: event.target.value })
						}
					/>
				</div>
				<div className="grid gap-1">
					<Label
						htmlFor={NOTE_FILTER_FIELD_ID.DATE_TO}
						className="text-xs text-muted-foreground"
					>
						{TABLE_MESSAGE.FILTER_TO}
					</Label>
					<Input
						id={NOTE_FILTER_FIELD_ID.DATE_TO}
						type="date"
						min={props.values.dateFrom}
						value={props.values.dateTo ?? ""}
						onChange={(event) => props.onChange({ dateTo: event.target.value })}
					/>
				</div>
			</div>
		</div>
		<div className="grid gap-1.5">
			<Label htmlFor={NOTE_FILTER_FIELD_ID.ATTACHMENTS}>
				{NOTE_MESSAGE.FILTER_ATTACHMENTS}
			</Label>
			<Select
				value={props.values.attachments ?? NOTE_FILTER_ANY}
				onValueChange={(value) =>
					props.onChange({ attachments: toNoteAttachmentFilter(value) })
				}
			>
				<SelectTrigger id={NOTE_FILTER_FIELD_ID.ATTACHMENTS} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={NOTE_FILTER_ANY}>
						{TABLE_MESSAGE.FILTER_ANY}
					</SelectItem>
					<SelectItem value={NOTE_ATTACHMENT_FILTER.WITH}>
						{NOTE_MESSAGE.FILTER_ATTACHMENTS_WITH}
					</SelectItem>
					<SelectItem value={NOTE_ATTACHMENT_FILTER.WITHOUT}>
						{NOTE_MESSAGE.FILTER_ATTACHMENTS_WITHOUT}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	</div>
);
