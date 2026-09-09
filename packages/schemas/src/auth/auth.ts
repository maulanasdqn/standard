import { z } from "zod";

export const sessionUserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	role: z.enum(["admin", "member", "viewer"]),
});
export type TSessionUser = z.infer<typeof sessionUserSchema>;

export const meSchema = z.object({
	user: sessionUserSchema,
	permissions: z.array(z.string()),
});
export type TMe = z.infer<typeof meSchema>;
