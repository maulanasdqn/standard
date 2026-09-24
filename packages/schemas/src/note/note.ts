import { z } from "zod";
import { userIdSchema } from "../auth/auth.ts";
import { baseSchema, type TEntityOf } from "../shared/base-schema.ts";
import { paginated, paginationSchema } from "../shared/pagination.ts";
import { searchQuerySchema } from "../shared/search.ts";
import { SORT_DIRECTION, sortDirectionSchema } from "../shared/sort.ts";

export const NOTE_TITLE_MAX = 200;
export const NOTE_BODY_MAX = 10_000;

export const noteVersionSchema = z.number().int().positive();

export const noteSchema = baseSchema(z.uuid()).extend({
	title: z.string().min(1).max(NOTE_TITLE_MAX),
	body: z.string().max(NOTE_BODY_MAX),
	authorId: userIdSchema,
	version: noteVersionSchema,
});
export type TNote = TEntityOf<z.infer<typeof noteSchema>>;

export const noteCreateInputSchema = z.object({
	title: z.string().min(1).max(NOTE_TITLE_MAX),
	body: z.string().max(NOTE_BODY_MAX).default(""),
});
export type TNoteCreateInput = z.infer<typeof noteCreateInputSchema>;

export const noteUpdateInputSchema = z.object({
	id: z.uuid(),
	version: noteVersionSchema,
	title: z.string().min(1).max(NOTE_TITLE_MAX).optional(),
	body: z.string().max(NOTE_BODY_MAX).optional(),
});
export type TNoteUpdateInput = z.infer<typeof noteUpdateInputSchema>;

export const noteIdInputSchema = z.object({ id: z.uuid() });
export type TNoteIdInput = z.infer<typeof noteIdInputSchema>;

export const NOTE_SORT = {
	TITLE: "title",
	CREATED_AT: "createdAt",
	UPDATED_AT: "updatedAt",
} as const;

export type TNoteSort = (typeof NOTE_SORT)[keyof typeof NOTE_SORT];

export const noteListInputSchema = paginationSchema.extend({
	search: searchQuerySchema.optional(),
	sortBy: z
		.enum([NOTE_SORT.TITLE, NOTE_SORT.CREATED_AT, NOTE_SORT.UPDATED_AT])
		.default(NOTE_SORT.CREATED_AT),
	sortDir: sortDirectionSchema.default(SORT_DIRECTION.DESC),
});
export type TNoteListInput = z.infer<typeof noteListInputSchema>;

export const noteListSchema = paginated(noteSchema);
export type TNoteList = z.infer<typeof noteListSchema>;
