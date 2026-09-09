import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { runtime } from "#/bootstrap/compose.ts";
import { AuthService } from "#/infrastructure/auth/auth-service.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { note } from "#/infrastructure/db/schema/note.ts";
import { user } from "#/infrastructure/db/schema/auth.ts";
import { logger } from "#/infrastructure/observability/logger.ts";

const ADMIN_EMAIL = "admin@app.test";
const ADMIN_PASSWORD = "admin-password-123";

const seed = Effect.gen(function* () {
	const { db } = yield* DbService;
	const { auth } = yield* AuthService;

	const existing = yield* Effect.promise(() =>
		db.select().from(user).where(eq(user.email, ADMIN_EMAIL)).limit(1),
	);

	const adminId: string = yield* match(existing[0])
		.with(P.nonNullable, (found) => Effect.succeed(found.id))
		.otherwise(() =>
			Effect.promise(async () => {
				const result = await auth.api.signUpEmail({
					body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "Admin" },
				});
				await db
					.update(user)
					.set({ role: "admin" })
					.where(eq(user.id, result.user.id));
				return result.user.id;
			}),
		);

	yield* Effect.promise(() =>
		db.insert(note).values({
			title: "Welcome",
			body: "This is a seeded note. Sign in as admin@app.test to see it.",
			authorId: adminId,
		}),
	);

	logger.info({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, "seeded admin");
});

await runtime.runPromise(seed);
process.exit(0);
