import { D } from "@mobily/ts-belt";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { EDatabase } from "#/application/shared/errors.ts";
import type {
	TCustomRoleRepo,
	TCustomRoleRow,
} from "#/domain/role/custom-role.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { customRole } from "#/infrastructure/db/schema/custom-role.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export class CustomRoleRepo extends Context.Service<
	CustomRoleRepo,
	TCustomRoleRepo
>()(SERVICE_TAG.CUSTOM_ROLE_REPO) {
	static readonly layer = Layer.effect(
		CustomRoleRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;

			const list: TCustomRoleRepo["list"] = () =>
				Effect.tryPromise({
					try: () => db.select().from(customRole).orderBy(customRole.label),
					catch: (cause) => new EDatabase({ cause }),
				});

			const findByKey: TCustomRoleRepo["findByKey"] = (key) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.select()
							.from(customRole)
							.where(eq(customRole.key, key))
							.limit(1);
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const create: TCustomRoleRepo["create"] = (
				{ key, label, description, permissions },
				createdBy,
			) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.insert(customRole)
							.values({
								key,
								label,
								description: description ?? null,
								permissions,
								createdBy,
							})
							.returning();
						return row as TCustomRoleRow;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const update: TCustomRoleRepo["update"] = ({ key, ...patch }) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.update(customRole)
							.set(D.merge(patch, { updatedAt: new Date() }))
							.where(eq(customRole.key, key))
							.returning();
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const remove: TCustomRoleRepo["remove"] = (key) =>
				Effect.tryPromise({
					try: async () => {
						const result = await db
							.delete(customRole)
							.where(eq(customRole.key, key))
							.returning({ id: customRole.id });
						return result.length > 0;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			return CustomRoleRepo.of({ list, findByKey, create, update, remove });
		}),
	).pipe(Layer.provide(DbService.layer));
}
