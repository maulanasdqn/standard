import { NEWSLETTER_SOURCE } from "@app/schemas";
import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { newsletterSubscribe } from "#/newsletter/application/newsletter-subscribe.ts";
import { NewsletterSubscriberRepo } from "#/newsletter/domain/newsletter-subscriber.ts";

const INPUT = { email: "reader@example.com", source: NEWSLETTER_SOURCE.BLOG };

describe("newsletterSubscribe", () => {
	it("saves the address and answers with it, whether or not it was new", async (): Promise<void> => {
		const subscribe = vi.fn().mockReturnValue(Effect.succeed(undefined));
		const testLayer = Layer.succeed(
			NewsletterSubscriberRepo,
			NewsletterSubscriberRepo.of({
				subscribe,
				list: vi.fn(),
				findById: vi.fn(),
				remove: vi.fn(),
			}),
		);

		const result = await Effect.runPromise(
			newsletterSubscribe(INPUT).pipe(Effect.provide(testLayer)),
		);

		expect(subscribe).toHaveBeenCalledWith(INPUT);
		expect(result).toEqual({ email: INPUT.email });
	});
});
