import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { NOTE_MESSAGE, TABLE_MESSAGE } from "@app/messages";
import { NOTE_ATTACHMENT_FILTER, NOTE_DATE_FIELD } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { DateRangeFields } from "#/routes/_authenticated/_components/date-range-fields.tsx";
import { FilterSelect } from "#/routes/_authenticated/_components/filter-select.tsx";
import { NOTE_FILTER_FIELD_ID } from "#/routes/_authenticated/notes/_constants/filter.ts";
import type { TNoteFilterValues } from "#/routes/_authenticated/notes/_hooks/use-note-filters.ts";
import {
	toNoteAttachmentFilter,
	toNoteDateField,
} from "#/routes/_authenticated/notes/_utils/note-filter-values.ts";

type TNoteFilterFieldsProps = {
	values: TNoteFilterValues;
	onChange: (patch: Partial<TNoteFilterValues>) => void;
};

const DATE_FIELD_OPTIONS = [
	{ value: NOTE_DATE_FIELD.CREATED_AT, label: NOTE_MESSAGE.CREATED_AT },
	{ value: NOTE_DATE_FIELD.UPDATED_AT, label: NOTE_MESSAGE.UPDATED_AT },
];

const ATTACHMENT_OPTIONS = [
	{
		value: NOTE_ATTACHMENT_FILTER.WITH,
		label: NOTE_MESSAGE.FILTER_ATTACHMENTS_WITH,
	},
	{
		value: NOTE_ATTACHMENT_FILTER.WITHOUT,
		label: NOTE_MESSAGE.FILTER_ATTACHMENTS_WITHOUT,
	},
];

export const NoteFilterFields: FC<TNoteFilterFieldsProps> = (
	props,
): ReactElement => (
	<>
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
		<DateRangeFields
			idPrefix={NOTE_FILTER_FIELD_ID.DATE}
			label={TABLE_MESSAGE.FILTER_DATE}
			range={props.values}
			onChange={props.onChange}
		>
			<FilterSelect
				id={NOTE_FILTER_FIELD_ID.DATE_FIELD}
				label={TABLE_MESSAGE.FILTER_DATE_FIELD}
				value={props.values.dateField ?? NOTE_DATE_FIELD.CREATED_AT}
				options={DATE_FIELD_OPTIONS}
				onChange={(value) =>
					props.onChange({ dateField: toNoteDateField(value ?? "") })
				}
			/>
		</DateRangeFields>
		<FilterSelect
			id={NOTE_FILTER_FIELD_ID.ATTACHMENTS}
			label={NOTE_MESSAGE.FILTER_ATTACHMENTS}
			value={props.values.attachments}
			options={ATTACHMENT_OPTIONS}
			onChange={(value) =>
				props.onChange({ attachments: toNoteAttachmentFilter(value ?? "") })
			}
		/>
	</>
);
