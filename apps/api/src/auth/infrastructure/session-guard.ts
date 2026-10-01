import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { match, P } from "ts-pattern";
import type { TDb } from "#/platform/db/client.ts";
import { user } from "#/platform/db/tables/auth.ts";
import { dbActive } from "#/platform/db/transaction.ts";

export const ACCOUNT_DEACTIVATED_CODE = "ACCOUNT_DEACTIVATED";

type TSessionDraft = { userId: string };

type TSessionGuard = (draft: TSessionDraft) => Promise<void>;

export const sessionGuardOf =
	(db: TDb, message: string): TSessionGuard =>
	async (draft: TSessionDraft): Promise<void> => {
		const [found] = await dbActive(db)
			.select({ deactivatedAt: user.deactivatedAt })
			.from(user)
			.where(eq(user.id, draft.userId))
			.limit(1);
		return match(found?.deactivatedAt)
			.with(P.instanceOf(Date), (): never => {
				throw new APIError("FORBIDDEN", {
					code: ACCOUNT_DEACTIVATED_CODE,
					message,
				});
			})
			.otherwise((): undefined => undefined);
	};
