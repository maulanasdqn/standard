import { eq } from "drizzle-orm";
import { compose } from "#/compose.ts";
import { note } from "#/infrastructure/db/schema/note.ts";
import { user } from "#/infrastructure/db/schema/auth.ts";

const { db, auth } = compose();

const ADMIN_EMAIL = "admin@app.test";
const ADMIN_PASSWORD = "admin-password-123";

const existing = await db
	.select()
	.from(user)
	.where(eq(user.email, ADMIN_EMAIL))
	.limit(1);

let adminId = existing[0]?.id;

if (!adminId) {
	const result = await auth.api.signUpEmail({
		body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "Admin" },
	});
	adminId = result.user.id;
	await db.update(user).set({ role: "admin" }).where(eq(user.id, adminId));
}

await db.insert(note).values({
	title: "Welcome",
	body: "This is a seeded note. Sign in as admin@app.test to see it.",
	authorId: adminId,
});

console.log(`seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (role=admin)`);
process.exit(0);
