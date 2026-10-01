import { z } from "zod";

const twoFactorPendingSchema = z.object({ twoFactorRedirect: z.literal(true) });

export const isTwoFactorPending = (data: unknown): boolean =>
	twoFactorPendingSchema.safeParse(data).success;
