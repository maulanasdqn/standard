import { z } from "zod";
import { userIdSchema } from "../auth/auth.ts";
import { baseSchema } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const noteSchema = baseSchema(z.uuid()).extend({
	title: z.string().min(1).max(200),
	body: z.string().max(10_000),
	authorId: userIdSchema,
});
export type TNote = z.infer<typeof noteSchema>;

export const noteCreateInputSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().max(10_000).default(""),
});
export type TNoteCreateInput = z.infer<typeof noteCreateInputSchema>;

export const noteUpdateInputSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1).max(200).optional(),
	body: z.string().max(10_000).optional(),
});
export type TNoteUpdateInput = z.infer<typeof noteUpdateInputSchema>;

export const noteIdInputSchema = z.object({ id: z.uuid() });
export type TNoteIdInput = z.infer<typeof noteIdInputSchema>;

export const noteListInputSchema = paginationSchema.extend({
	search: z.string().optional(),
});
export type TNoteListInput = z.infer<typeof noteListInputSchema>;

export const noteListSchema = paginated(noteSchema);
export type TNoteList = z.infer<typeof noteListSchema>;
