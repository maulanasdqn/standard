import { A, D } from "@mobily/ts-belt";
import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EAuth, EDatabase } from "#/application/shared/errors.ts";
import { offsetFor } from "#/domain/shared/pagination.ts";
import type { TUserRepo, TUserRow } from "#/domain/user/user.ts";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { session, user } from "#/infrastructure/db/schema/auth.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

const CREDENTIAL_PROVIDER_ID = "credential";
const USER_PROVISIONING_METHOD = "admin";

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) =>
			or(ilike(user.name, `%${value}%`), ilike(user.email, `%${value}%`)),
		)
		.otherwise(() => undefined);

const roleWhere = (role: string | undefined): SQL | undefined =>
	match(role)
		.with(P.nonNullable, (value) => eq(user.role, value))
		.otherwise(() => undefined);

export class UserRepo extends Context.Service<UserRepo, TUserRepo>()(
	SERVICE_TAG.USER_REPO,
) {
	static readonly layer = Layer.effect(
		UserRepo,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const { auth } = yield* AuthService;

			const list: TUserRepo["list"] = ({ page, pageSize, search, role }) => {
				const where = and(searchWhere(search), roleWhere(role));

				return Effect.tryPromise({
					try: async () => {
						const [items, [{ value: total }]] = await Promise.all([
							db
								.select()
								.from(user)
								.where(where)
								.limit(pageSize)
								.offset(offsetFor({ page, pageSize }))
								.orderBy(user.createdAt),
							db.select({ value: count() }).from(user).where(where),
						]);
						return { items, total };
					},
					catch: (cause) => new EDatabase({ cause }),
				});
			};

			const findById: TUserRepo["findById"] = (id) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.select()
							.from(user)
							.where(eq(user.id, id))
							.limit(1);
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const findByEmail: TUserRepo["findByEmail"] = (email) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.select()
							.from(user)
							.where(eq(user.email, email.toLowerCase()))
							.limit(1);
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const create: TUserRepo["create"] = ({ name, email, password, role }) =>
				Effect.tryPromise({
					try: async () => {
						const ctx = await auth.$context;
						const created = await ctx.internalAdapter.createUser(
							{ name, email: email.toLowerCase(), emailVerified: false, role },
							{ method: USER_PROVISIONING_METHOD },
						);
						const hashed = await ctx.password.hash(password);
						await ctx.internalAdapter.linkAccount({
							providerId: CREDENTIAL_PROVIDER_ID,
							accountId: created.id,
							userId: created.id,
							password: hashed,
						});
						const [row] = await db
							.select()
							.from(user)
							.where(eq(user.id, created.id))
							.limit(1);
						return row as TUserRow;
					},
					catch: (cause) => new EAuth({ cause }),
				});

			const update: TUserRepo["update"] = ({ id, ...patch }) =>
				Effect.tryPromise({
					try: async () => {
						const [row] = await db
							.update(user)
							.set(D.merge(patch, { updatedAt: new Date() }))
							.where(eq(user.id, id))
							.returning();
						return row ?? null;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const remove: TUserRepo["remove"] = (id) =>
				Effect.tryPromise({
					try: async () => {
						const result = await db
							.delete(user)
							.where(eq(user.id, id))
							.returning({ id: user.id });
						return result.length > 0;
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			const resetPassword: TUserRepo["resetPassword"] = ({ id, password }) =>
				Effect.tryPromise({
					try: async () => {
						const ctx = await auth.$context;
						const hashed = await ctx.password.hash(password);
						await ctx.internalAdapter.updatePassword(id, hashed);
						await db.delete(session).where(eq(session.userId, id));
					},
					catch: (cause) => new EAuth({ cause }),
				});

			const countByRole: TUserRepo["countByRole"] = () =>
				Effect.tryPromise({
					try: async () => {
						const rows = await db
							.select({ role: user.role, value: count() })
							.from(user)
							.groupBy(user.role);
						return D.fromPairs(
							A.map(rows, (row) => [row.role, row.value] as const),
						);
					},
					catch: (cause) => new EDatabase({ cause }),
				});

			return UserRepo.of({
				list,
				findById,
				findByEmail,
				create,
				update,
				remove,
				resetPassword,
				countByRole,
			});
		}),
	).pipe(Layer.provide(Layer.mergeAll(DbService.layer, AuthService.layer)));
}
