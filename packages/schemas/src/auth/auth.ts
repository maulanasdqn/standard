import { ROLE } from "@app/permissions";
import { z } from "zod";

export const sessionUserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	role: z.enum([ROLE.ADMIN, ROLE.MEMBER, ROLE.VIEWER]),
});
export type TSessionUser = z.infer<typeof sessionUserSchema>;

export const meSchema = z.object({
	user: sessionUserSchema,
	permissions: z.array(z.string()),
});
export type TMe = z.infer<typeof meSchema>;

export const loginInputSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: z.string().min(1, "Enter your password."),
});
export type TLoginInput = z.infer<typeof loginInputSchema>;
