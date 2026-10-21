import {
	ACTIVITY_ACTION,
	ACTIVITY_DETAIL,
	ACTIVITY_RESOURCE_TYPE,
	activityDetails,
} from "@app/activity";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import type { TNewsletterSubscriberIdInput } from "@app/schemas";
import { Effect } from "effect";
import { ENotFound, type EDatabase } from "#/shared/errors.ts";
import {
	ActivityRecorder,
	type TActivityRecorderId,
} from "#/shared/activity-recorder.ts";
import {
	NewsletterSubscriberRepo,
	type TNewsletterSubscriberRepoId,
} from "#/newsletter/domain/newsletter-subscriber.ts";

export const newsletterSubscriberDelete = Effect.fn(
	"newsletterSubscriberDelete",
)(function* (
	{ id }: TNewsletterSubscriberIdInput,
	actorId: string,
): Effect.fn.Return<
	{ id: string },
	ENotFound | EDatabase,
	TNewsletterSubscriberRepoId | TActivityRecorderId
> {
	const repo = yield* NewsletterSubscriberRepo;
	const activityRepo = yield* ActivityRecorder;
	const existing = yield* repo.findById(id);

	if (existing === null) {
		return yield* new ENotFound({ message: NEWSLETTER_MESSAGE.NOT_FOUND });
	}

	const removed = yield* repo.remove(id);

	if (!removed) {
		return yield* new ENotFound({ message: NEWSLETTER_MESSAGE.NOT_FOUND });
	}

	yield* activityRepo.insert({
		actorId,
		action: ACTIVITY_ACTION.NEWSLETTER_SUBSCRIBER_DELETE,
		resourceType: ACTIVITY_RESOURCE_TYPE.NEWSLETTER_SUBSCRIBER,
		resourceId: id,
		metadata: activityDetails({ [ACTIVITY_DETAIL.EMAIL]: existing.email }),
	});

	return { id };
});
