import {
	NOTE_ATTACHMENT_FILTER,
	NOTE_DATE_FIELD,
	type TNoteAttachmentFilter,
	type TNoteDateField,
} from "@app/schemas";
import { match } from "ts-pattern";

export const toNoteDateField = (value: string): TNoteDateField =>
	match(value)
		.with(
			NOTE_DATE_FIELD.UPDATED_AT,
			(): TNoteDateField => NOTE_DATE_FIELD.UPDATED_AT,
		)
		.otherwise((): TNoteDateField => NOTE_DATE_FIELD.CREATED_AT);

export const toNoteAttachmentFilter = (
	value: string,
): TNoteAttachmentFilter | undefined =>
	match(value)
		.with(
			NOTE_ATTACHMENT_FILTER.WITH,
			(): TNoteAttachmentFilter => NOTE_ATTACHMENT_FILTER.WITH,
		)
		.with(
			NOTE_ATTACHMENT_FILTER.WITHOUT,
			(): TNoteAttachmentFilter => NOTE_ATTACHMENT_FILTER.WITHOUT,
		)
		.otherwise((): undefined => undefined);
