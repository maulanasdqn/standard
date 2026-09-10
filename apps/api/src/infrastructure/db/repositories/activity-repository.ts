import type { TActivityEntry, TActivityRepo } from "@app/activity";
import type { TActivityListInput } from "@app/schemas";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EDatabase } from "#/application/shared/errors.ts";
import type { TActivityRow } from "#/domain/activity/activity.ts";
import { offsetFor, type TRowPage } from "#/domain/shared/pagination.ts";
import type { TDb } from "#/infrastructure/db/client.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { activityLog } from "#/infrastructure/db/schema/activity.ts";
import { user } from "#/infrastructure/db/schema/auth.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export const activityRepositoryCreate = (db: TDb): TActivityRepo => ({
	insert: async (entry: TActivityEntry): Promise<void> => {
		await db.insert(activityLog).values({
			actorId: entry.actorId,
			action: entry.action,
			entityType: entry.entityType,
			entityId: entry.entityId,
			metadata: entry.metadata ?? null,
		});
	},
});

export type TActivityRepoShape = {
	insert: (entry: TActivityEntry) => Effect.Effect<void, EDatabase>;
	list: (
		input: TActivityListInput,
	) => Effect.Effect<TRowPage<TActivityRow>, EDatabase>;
};

const optionalEq = (
	column: AnyPgColumn,
	value: string | undefined,
): SQL | undefined =>
	match(value)
		.with(P.nonNullable, (found) => eq(column, found))
		.otherwise(() => undefined);

export class ActivityRepo extends Context.Service<
	ActivityRepo,
	TActivityRepoShape
>()(SERVICE_TAG.ACTIVITY_REPO) {
	static readonly layer = Layer.effect(
		ActivityRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const repo = activityRepositoryCreate(db);

			const insert: TActivityRepoShape["insert"] = (entry: TActivityEntry) =>
				Effect.tryPromise({
					try: () => repo.insert(entry),
					catch: (cause) => new EDatabase({ cause }),
				});

			const list: TActivityRepoShape["list"] = ({
				page,
				pageSize,
				action,
				entityType,
				actorId,
			}) => {
				const where = and(
					optionalEq(activityLog.action, action),
					optionalEq(activityLog.entityType, entityType),
					optionalEq(activityLog.actorId, actorId),
				);

				return Effect.tryPromise({
					try: async () => {
						const [items, [{ value: total }]] = await Promise.all([
							db
								.select({
									id: activityLog.id,
									actorId: activityLog.actorId,
									actorEmail: user.email,
									action: activityLog.action,
									entityType: activityLog.entityType,
									entityId: activityLog.entityId,
									metadata: activityLog.metadata,
									createdAt: activityLog.createdAt,
								})
								.from(activityLog)
								.leftJoin(user, eq(user.id, activityLog.actorId))
								.where(where)
								.orderBy(desc(activityLog.createdAt))
								.limit(pageSize)
								.offset(offsetFor({ page, pageSize })),
							db.select({ value: count() }).from(activityLog).where(where),
						]);
						return { items, total };
					},
					catch: (cause) => new EDatabase({ cause }),
				});
			};

			return ActivityRepo.of({ insert, list });
		}),
	).pipe(Layer.provide(DbService.layer));
}
