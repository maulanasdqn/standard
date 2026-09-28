import { describe, expect, it } from "vitest";
import { STORAGE_CONTENT_TYPE, STORAGE_MEGABYTE } from "./storage-limits.ts";
import { storageCreate } from "./storage.ts";
import { STORAGE_CONTENT_DISPOSITION } from "./storage-url.ts";

const credentials = {
	accessKeyId: "test-access-key",
	secretAccessKey: "test-secret-key",
	bucket: "test-bucket",
	maxBytes: STORAGE_MEGABYTE,
	allowedContentTypes: [STORAGE_CONTENT_TYPE.PNG],
} as const;

describe("storageCreate.getUrl signing options", () => {
	it("signs the response type and disposition into the url", async (): Promise<void> => {
		const storage = storageCreate({
			...credentials,
			endpoint: "https://storage.example.com",
		});

		const url = new URL(
			await storage.getUrl("notes/pixel.png", 120, {
				contentType: STORAGE_CONTENT_TYPE.PNG,
				contentDisposition: STORAGE_CONTENT_DISPOSITION.INLINE,
			}),
		);

		expect(url.searchParams.get("response-content-type")).toBe(
			STORAGE_CONTENT_TYPE.PNG,
		);
		expect(url.searchParams.get("response-content-disposition")).toBe(
			STORAGE_CONTENT_DISPOSITION.INLINE,
		);
		expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("host");
	});

	it("signs for the public endpoint when one is set", async (): Promise<void> => {
		const storage = storageCreate({
			...credentials,
			endpoint: "http://storage.internal:9000",
			publicEndpoint: "https://files.example.com",
		});

		const url = new URL(await storage.getUrl("notes/pixel.png", 120));

		expect(url.origin).toBe("https://files.example.com");
	});
});
