import { noteListInputSchema } from "@app/schemas";
import {
	type TSearchForm,
	useSearchForm,
} from "#/libs/forms/use-search-form.ts";
import { useNoteSearch } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteSearchFormSchema = noteListInputSchema.pick({ search: true });

export const useNoteSearchForm = (): TSearchForm<typeof noteSearchFormSchema> =>
	useSearchForm(noteSearchFormSchema, useNoteSearch());
