import { z } from "zod";
import { paginated, paginationSchema } from "../shared/pagination.ts";

export const noteSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1).max(200),
	body: z.string().max(10_000),
	authorId: z.uuid(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});
export type TNote = z.infer<typeof noteSchema>;

export const createNoteInputSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().max(10_000).default(""),
});
export type TCreateNoteInput = z.infer<typeof createNoteInputSchema>;

export const updateNoteInputSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1).max(200).optional(),
	body: z.string().max(10_000).optional(),
});
export type TUpdateNoteInput = z.infer<typeof updateNoteInputSchema>;

export const noteIdInputSchema = z.object({ id: z.uuid() });
export type TNoteIdInput = z.infer<typeof noteIdInputSchema>;

export const listNotesInputSchema = paginationSchema.extend({
	search: z.string().optional(),
});
export type TListNotesInput = z.infer<typeof listNotesInputSchema>;

export const noteListSchema = paginated(noteSchema);
export type TNoteList = z.infer<typeof noteListSchema>;
