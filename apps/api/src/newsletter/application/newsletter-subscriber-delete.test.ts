import { ACTIVITY_ACTION, ACTIVITY_DETAIL } from "@app/activity";
import { NEWSLETTER_SOURCE, NEWSLETTER_STATUS } from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { newsletterSubscriberDelete } from "#/newsletter/application/newsletter-subscriber-delete.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRepo,
	type TNewsletterSubscriberRepoId,
	type TNewsletterSubscriberRow,
} from "#/newsletter/domain/newsletter-subscriber.ts";
import {
	ActivityRecorder,
	type TActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import { ENotFound } from "#/shared/errors.ts";

const ACTOR_ID = "33333333-3333-4333-8333-333333333333";
const SUBSCRIBER_ID = "11111111-1111-4111-8111-111111111111";

const row: TNewsletterSubscriberRow = {
	id: SUBSCRIBER_ID,
	email: "reader@example.com",
	status: NEWSLETTER_STATUS.PENDING,
	source: NEWSLETTER_SOURCE.LANDING,
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const layerWith = (
	found: TNewsletterSubscriberRow | null,
	remove: TNewsletterSubscriberRepo["remove"],
	insert: TActivityRecorder["insert"],
): Layer.Layer<TNewsletterSubscriberRepoId | TActivityRecorderId> =>
	Layer.merge(
		Layer.succeed(
			NewsletterSubscriberRepo,
			NewsletterSubscriberRepo.of({
				subscribe: vi.fn(),
				list: vi.fn(),
				findById: vi.fn().mockReturnValue(Effect.succeed(found)),
				remove,
			}),
		),
		Layer.succeed(ActivityRecorder, ActivityRecorder.of({ insert })),
	);

describe("newsletterSubscriberDelete", () => {
	it("removes the subscriber and records who removed which address", async (): Promise<void> => {
		const remove = vi.fn().mockReturnValue(Effect.succeed(true));
		const insert = vi.fn().mockReturnValue(Effect.succeed(undefined));

		const result = await Effect.runPromise(
			newsletterSubscriberDelete({ id: SUBSCRIBER_ID }, ACTOR_ID).pipe(
				Effect.provide(layerWith(row, remove, insert)),
			),
		);

		expect(result).toEqual({ id: SUBSCRIBER_ID });
		expect(remove).toHaveBeenCalledWith(SUBSCRIBER_ID);
		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({
				actorId: ACTOR_ID,
				action: ACTIVITY_ACTION.NEWSLETTER_SUBSCRIBER_DELETE,
				resourceId: SUBSCRIBER_ID,
				metadata: { [ACTIVITY_DETAIL.EMAIL]: row.email },
			}),
		);
	});

	it("fails with ENotFound and records nothing when the subscriber is gone", async (): Promise<void> => {
		const remove = vi.fn();
		const insert = vi.fn();

		const error = await Effect.runPromise(
			newsletterSubscriberDelete({ id: SUBSCRIBER_ID }, ACTOR_ID).pipe(
				Effect.provide(layerWith(null, remove, insert)),
				Effect.flip,
			),
		);

		expect(error).toBeInstanceOf(ENotFound);
		expect(remove).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});
});
