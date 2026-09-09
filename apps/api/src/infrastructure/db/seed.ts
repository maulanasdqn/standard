import { eq } from "drizzle-orm";
import { match, P } from "ts-pattern";
import { compose } from "#/bootstrap/compose.ts";
import { user } from "#/infrastructure/db/schema/auth.ts";
import { note } from "#/infrastructure/db/schema/note.ts";
import { logger } from "#/infrastructure/observability/logger.ts";

const { db, auth } = await compose();

const ADMIN_EMAIL = "admin@app.test";
const ADMIN_PASSWORD = "admin-password-123";

const existing = await db
	.select()
	.from(user)
	.where(eq(user.email, ADMIN_EMAIL))
	.limit(1);

const adminId: string = await match(existing[0])
	.with(P.nonNullable, (found) => Promise.resolve(found.id))
	.otherwise(async () => {
		const result = await auth.api.signUpEmail({
			body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "Admin" },
		});
		await db
			.update(user)
			.set({ role: "admin" })
			.where(eq(user.id, result.user.id));
		return result.user.id;
	});

await db.insert(note).values({
	title: "Welcome",
	body: "This is a seeded note. Sign in as admin@app.test to see it.",
	authorId: adminId,
});

logger.info({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, "seeded admin");
process.exit(0);
