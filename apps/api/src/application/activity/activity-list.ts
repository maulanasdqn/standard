import type { TActivityList, TActivityListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import { toActivityDto } from "#/application/activity/to-activity-dto.ts";
import type { EDatabase } from "#/domain/shared/errors.ts";
import { ActivityRepo } from "#/domain/activity/activity.ts";

export const activityList = Effect.fn("activityList")(function* (
	input: TActivityListInput,
): Effect.fn.Return<TActivityList, EDatabase, ActivityRepo> {
	const activityRepo = yield* ActivityRepo;
	const { items, total } = yield* activityRepo.list(input);
	return {
		items: A.map(items, toActivityDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
