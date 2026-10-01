import { USER_MESSAGE } from "@app/messages";
import { D } from "@mobily/ts-belt";
import { count, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { EAuth, EConflict, EDatabase } from "#/shared/errors.ts";
import { offsetFor, orderFor } from "#/shared/pagination.ts";
import { USER_SORT, type TUserSort } from "@app/schemas";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { UserRepo, type TUserRepo, type TUserRow } from "#/user/domain/user.ts";
import { AuthService } from "#/auth/index.ts";
import { DbService } from "#/platform/db/db-service.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { isUniqueViolation } from "#/platform/db/unique-violation.ts";
import { session, user } from "#/platform/db/tables/auth.ts";
import { userAdminOpsOf } from "#/user/infrastructure/user-admin-ops.ts";
import { userListWhere } from "#/user/infrastructure/user-list-where.ts";
import { userPatchOf } from "#/user/infrastructure/user-patch.ts";

const CREDENTIAL_PROVIDER_ID = "credential";
const USER_PROVISIONING_METHOD = "admin";

const SORT_COLUMN: Record<TUserSort, AnyPgColumn> = {
	[USER_SORT.NAME]: user.name,
	[USER_SORT.EMAIL]: user.email,
	[USER_SORT.ROLE]: user.role,
	[USER_SORT.CREATED_AT]: user.createdAt,
};

export const userRepoLayer = Layer.effect(
	UserRepo,
	Effect.gen(function* () {
		const { db } = yield* DbService;
		const { auth } = yield* AuthService;

		const list: TUserRepo["list"] = (input) => {
			const { page, pageSize, sortBy, sortDir } = input;
			const where = userListWhere(input);

			return Effect.tryPromise({
				try: async () => {
					const [items, [{ value: total }]] = await Promise.all([
						dbActive(db)
							.select()
							.from(user)
							.where(where)
							.limit(pageSize)
							.offset(offsetFor({ page, pageSize }))
							.orderBy(orderFor(SORT_COLUMN[sortBy], sortDir)),
						dbActive(db).select({ value: count() }).from(user).where(where),
					]);
					return { items, total };
				},
				catch: (cause) => new EDatabase({ cause }),
			});
		};

		const findById: TUserRepo["findById"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
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
					const [row] = await dbActive(db)
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
						{ name, email: email.toLowerCase(), emailVerified: true, role },
						{ method: USER_PROVISIONING_METHOD },
					);
					const hashed = await ctx.password.hash(password);
					await ctx.internalAdapter.linkAccount({
						providerId: CREDENTIAL_PROVIDER_ID,
						accountId: created.id,
						userId: created.id,
						password: hashed,
					});
					const [row] = await dbActive(db)
						.select()
						.from(user)
						.where(eq(user.id, created.id))
						.limit(1);
					return row as TUserRow;
				},
				catch: (cause) =>
					isUniqueViolation(cause)
						? new EConflict({ message: USER_MESSAGE.EMAIL_TAKEN })
						: new EAuth({ cause }),
			});

		const update: TUserRepo["update"] = ({ id, ...patch }) =>
			Effect.tryPromise({
				try: async () => {
					const [row] = await dbActive(db)
						.update(user)
						.set(D.merge(userPatchOf(patch), { updatedAt: new Date() }))
						.where(eq(user.id, id))
						.returning();
					return row ?? null;
				},
				catch: (cause) =>
					isUniqueViolation(cause)
						? new EConflict({ message: USER_MESSAGE.EMAIL_TAKEN })
						: new EDatabase({ cause }),
			});

		const remove: TUserRepo["remove"] = (id) =>
			Effect.tryPromise({
				try: async () => {
					const result = await dbActive(db)
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
					await dbActive(db).delete(session).where(eq(session.userId, id));
				},
				catch: (cause) => new EAuth({ cause }),
			});

		return UserRepo.of({
			list,
			findById,
			findByEmail,
			create,
			update,
			remove,
			resetPassword,
			...userAdminOpsOf(db, auth),
		});
	}),
);
