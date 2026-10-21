import {
	NEWSLETTER_SORT,
	NEWSLETTER_SOURCE,
	NEWSLETTER_STATUS,
	SORT_DIRECTION,
} from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { newsletterSubscriberList } from "#/newsletter/application/newsletter-subscriber-list.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRow,
} from "#/newsletter/domain/newsletter-subscriber.ts";

const INPUT = {
	page: 2,
	pageSize: 10,
	search: "example",
	sortBy: NEWSLETTER_SORT.EMAIL,
	sortDir: SORT_DIRECTION.ASC,
};

const row: TNewsletterSubscriberRow = {
	id: "11111111-1111-4111-8111-111111111111",
	email: "reader@example.com",
	status: NEWSLETTER_STATUS.PENDING,
	source: NEWSLETTER_SOURCE.LANDING,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-02T00:00:00Z"),
};

describe("newsletterSubscriberList", () => {
	it("returns the page of subscribers in their wire shape with the total", async (): Promise<void> => {
		const list = vi
			.fn()
			.mockReturnValue(Effect.succeed({ items: [row], total: 11 }));
		const testLayer = Layer.succeed(
			NewsletterSubscriberRepo,
			NewsletterSubscriberRepo.of({
				subscribe: vi.fn(),
				list,
				findById: vi.fn(),
				remove: vi.fn(),
			}),
		);

		const result = await Effect.runPromise(
			newsletterSubscriberList(INPUT).pipe(Effect.provide(testLayer)),
		);

		expect(result).toEqual({
			items: [
				{
					id: row.id,
					email: row.email,
					status: row.status,
					source: row.source,
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-02T00:00:00.000Z",
				},
			],
			total: 11,
			page: INPUT.page,
			pageSize: INPUT.pageSize,
		});
	});
});
