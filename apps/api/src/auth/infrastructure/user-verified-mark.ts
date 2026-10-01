import { eq } from "drizzle-orm";
import type { TDb } from "#/platform/db/client.ts";
import { user } from "#/platform/db/tables/auth.ts";
import { dbActive } from "#/platform/db/transaction.ts";

export const userVerifiedMark = async (
	db: TDb,
	userId: string,
): Promise<void> => {
	await dbActive(db)
		.update(user)
		.set({ emailVerified: true, updatedAt: new Date() })
		.where(eq(user.id, userId));
};
