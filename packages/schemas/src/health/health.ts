import { z } from "zod";

export const HEALTH_STATUS = {
	OK: "ok",
	READY: "ready",
} as const;
export type THealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];

export const healthSchema = z.object({
	status: z.literal(HEALTH_STATUS.OK),
	version: z.string(),
});
export type THealth = z.infer<typeof healthSchema>;
