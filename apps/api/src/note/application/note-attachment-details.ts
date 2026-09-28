import {
	ACTIVITY_DETAIL,
	activityDetails,
	type TActivityDetails,
} from "@app/activity";
import type { TNoteAttachmentRow } from "#/note/domain/note-attachment.ts";

export const noteAttachmentDetails = (
	row: TNoteAttachmentRow,
): TActivityDetails =>
	activityDetails({
		[ACTIVITY_DETAIL.NOTE_ID]: row.noteId,
		[ACTIVITY_DETAIL.FILE_NAME]: row.fileName,
		[ACTIVITY_DETAIL.BYTE_SIZE]: row.byteSize,
	});
