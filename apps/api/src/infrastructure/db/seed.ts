import { ROLE } from "@app/permissions";
import type { TUserCreateInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { runtime } from "#/bootstrap/compose.ts";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { user } from "#/infrastructure/db/schema/auth.ts";
import { note } from "#/infrastructure/db/schema/note.ts";
import { logger } from "#/infrastructure/observability/logger.ts";

const ADMIN_USER: TUserCreateInput = {
	name: "Admin",
	email: "admin@app.test",
	password: "admin-password-123",
	role: ROLE.ADMIN,
};

const EXTRA_USERS: readonly TUserCreateInput[] = [
	{
		name: "Member",
		email: "member@app.test",
		password: "member-password-123",
		role: ROLE.MEMBER,
	},
	{
		name: "Viewer",
		email: "viewer@app.test",
		password: "viewer-password-123",
		role: ROLE.VIEWER,
	},
];

const userEnsure = (
	seedUser: TUserCreateInput,
): Effect.Effect<string, never, DbService | AuthService> =>
	Effect.gen(function* () {
		const { db } = yield* DbService;
		const { auth } = yield* AuthService;

		const existing = yield* Effect.promise(() =>
			db.select().from(user).where(eq(user.email, seedUser.email)).limit(1),
		);

		return yield* match(existing[0])
			.with(P.nonNullable, (found) => Effect.succeed(found.id))
			.otherwise(() =>
				Effect.promise(async () => {
					const result = await auth.api.signUpEmail({
						body: {
							email: seedUser.email,
							password: seedUser.password,
							name: seedUser.name,
						},
					});
					await db
						.update(user)
						.set({ role: seedUser.role })
						.where(eq(user.id, result.user.id));
					return result.user.id;
				}),
			);
	});

const seed = Effect.gen(function* () {
	const { db } = yield* DbService;

	const adminId = yield* userEnsure(ADMIN_USER);
	yield* Effect.forEach(EXTRA_USERS, userEnsure);

	yield* Effect.promise(() =>
		db.insert(note).values({
			title: "Welcome",
			body: "This is a seeded note. Sign in as admin@app.test to see it.",
			authorId: adminId,
		}),
	);

	logger.info(
		{
			users: A.map([ADMIN_USER, ...EXTRA_USERS], (seedUser) => ({
				email: seedUser.email,
				password: seedUser.password,
				role: seedUser.role,
			})),
		},
		"seeded users",
	);
});

await runtime.runPromise(seed);
process.exit(0);
