import { NOTE_ATTACHMENT_CONTENT_TYPES } from "@app/schemas";
import { STORAGE_IMAGE_CONTENT_TYPES } from "@app/storage";
import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";

describe("note attachment content types", () => {
	it("stays within what the storage client is configured to accept", (): void => {
		const covered = A.all(NOTE_ATTACHMENT_CONTENT_TYPES, (contentType) =>
			A.includes(STORAGE_IMAGE_CONTENT_TYPES, contentType),
		);

		expect(covered).toBe(true);
	});
});
