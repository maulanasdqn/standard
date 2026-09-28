import { ACTIVITY_DETAIL } from "@app/activity";
import { NOT_SET } from "@app/format";
import { describe, expect, it } from "vitest";
import { metadataLabel } from "#/routes/_authenticated/activity/_utils/metadata-label.ts";

const NOTE_ID = "11111111-1111-4111-8111-111111111111";

describe("metadataLabel", () => {
	it("shows a dash when an entry carries no details", (): void => {
		expect(metadataLabel(null)).toBe(NOT_SET);
		expect(metadataLabel({})).toBe(NOT_SET);
	});

	it("labels each detail in words and joins them in a fixed order", (): void => {
		expect(
			metadataLabel({
				[ACTIVITY_DETAIL.ROLE]: "member",
				[ACTIVITY_DETAIL.EMAIL]: "member@test.app",
			}),
		).toBe("Email: member@test.app · Role: member");
	});

	it("shows a change as the previous value then the new one", (): void => {
		expect(
			metadataLabel({
				[ACTIVITY_DETAIL.ROLE]: "viewer",
				[ACTIVITY_DETAIL.PREVIOUS_ROLE]: "member",
			}),
		).toBe("Role: member → viewer");
	});

	it("lists the permissions a role gained and lost", (): void => {
		expect(
			metadataLabel({
				[ACTIVITY_DETAIL.LABEL]: "Reviewer",
				[ACTIVITY_DETAIL.PERMISSIONS_ADDED]: "note:read, note:update",
				[ACTIVITY_DETAIL.PERMISSIONS_REMOVED]: "user:delete",
			}),
		).toBe(
			"Label: Reviewer · Added: note:read, note:update · Removed: user:delete",
		);
	});

	it("formats a file size and never shows the note id", (): void => {
		expect(
			metadataLabel({
				[ACTIVITY_DETAIL.NOTE_ID]: NOTE_ID,
				[ACTIVITY_DETAIL.FILE_NAME]: "pixel.png",
				[ACTIVITY_DETAIL.BYTE_SIZE]: 2048,
			}),
		).toBe("File: pixel.png · Size: 2 KB");
	});

	it("ignores details it does not know and shows a dash when nothing is left", (): void => {
		expect(metadataLabel({ [ACTIVITY_DETAIL.NOTE_ID]: NOTE_ID })).toBe(NOT_SET);
		expect(metadataLabel({ revoked: true })).toBe(NOT_SET);
	});
});
