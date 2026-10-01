import { USER_MESSAGE } from "@app/messages";
import { and, desc, eq, gt } from "drizzle-orm";
import { Effect } from "effect";
import type { TAuth } from "#/auth/index.ts";
import type { TDb } from "#/platform/db/client.ts";
import { session, user } from "#/platform/db/tables/auth.ts";
import { twoFactor } from "#/platform/db/tables/two-factor.ts";
import { dbActive } from "#/platform/db/transaction.ts";
import { isUniqueViolation } from "#/platform/db/unique-violation.ts";
import { EAuth, EConflict, EDatabase } from "#/shared/errors.ts";
import type { TUserRepo, TUserRow } from "#/user/domain/user.ts";

const USER_INVITE_METHOD = "invite";

type TUserAdminOps = Pick<
	TUserRepo,
	| "invite"
	| "deactivate"
	| "reactivate"
	| "sessions"
	| "sessionRevoke"
	| "sessionsRevoke"
	| "twoFactorReset"
>;

export const userAdminOpsOf = (db: TDb, auth: TAuth): TUserAdminOps => {
	const deactivatedSet = (
		id: string,
		deactivatedAt: Date | null,
	): Effect.Effect<TUserRow | null, EDatabase> =>
		Effect.tryPromise({
			try: async (): Promise<TUserRow | null> => {
				const [row] = await dbActive(db)
					.update(user)
					.set({ deactivatedAt, updatedAt: new Date() })
					.where(eq(user.id, id))
					.returning();
				return row ?? null;
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	const sessionsRevoke: TUserAdminOps["sessionsRevoke"] = (userId) =>
		Effect.tryPromise({
			try: async (): Promise<void> => {
				await dbActive(db).delete(session).where(eq(session.userId, userId));
			},
			catch: (cause) => new EDatabase({ cause }),
		});

	return {
		invite: ({ name, email, role }) =>
			Effect.tryPromise({
				try: async (): Promise<TUserRow> => {
					const ctx = await auth.$context;
					const created = await ctx.internalAdapter.createUser(
						{ name, email: email.toLowerCase(), emailVerified: false, role },
						{ method: USER_INVITE_METHOD },
					);
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
			}),
		deactivate: (id) =>
			deactivatedSet(id, new Date()).pipe(Effect.tap(() => sessionsRevoke(id))),
		reactivate: (id) => deactivatedSet(id, null),
		sessions: (userId) =>
			Effect.tryPromise({
				try: () =>
					dbActive(db)
						.select({
							id: session.id,
							ipAddress: session.ipAddress,
							userAgent: session.userAgent,
							createdAt: session.createdAt,
							updatedAt: session.updatedAt,
							expiresAt: session.expiresAt,
						})
						.from(session)
						.where(
							and(
								eq(session.userId, userId),
								gt(session.expiresAt, new Date()),
							),
						)
						.orderBy(desc(session.updatedAt)),
				catch: (cause) => new EDatabase({ cause }),
			}),
		sessionRevoke: (userId, sessionId) =>
			Effect.tryPromise({
				try: async (): Promise<boolean> => {
					const removed = await dbActive(db)
						.delete(session)
						.where(and(eq(session.userId, userId), eq(session.id, sessionId)))
						.returning({ id: session.id });
					return removed.length > 0;
				},
				catch: (cause) => new EDatabase({ cause }),
			}),
		sessionsRevoke,
		twoFactorReset: (id) =>
			Effect.tryPromise({
				try: async (): Promise<TUserRow | null> => {
					await dbActive(db).delete(twoFactor).where(eq(twoFactor.userId, id));
					const [row] = await dbActive(db)
						.update(user)
						.set({ twoFactorEnabled: false, updatedAt: new Date() })
						.where(eq(user.id, id))
						.returning();
					return row ?? null;
				},
				catch: (cause) => new EDatabase({ cause }),
			}),
	};
};
