import { type TNote, noteUpdateInputSchema } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useNavigate } from "@tanstack/react-router";
import type { z } from "zod";
import {
	type TConfirmedForm,
	useConfirmedForm,
} from "#/routes/_authenticated/_hooks/use-confirmed-form.ts";
import { useNoteUpdate } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteEditFormSchema = noteUpdateInputSchema
	.pick({ title: true, body: true })
	.required();

type TNoteEditFormValues = z.input<typeof noteEditFormSchema>;

type TNoteEditForm = TConfirmedForm<
	TNoteEditFormValues,
	typeof noteEditFormSchema
> & {
	isPending: boolean;
};

export const useNoteEditForm = (note: TNote): TNoteEditForm => {
	const navigate = useNavigate();
	const noteUpdate = useNoteUpdate();

	const defaultValues: TNoteEditFormValues = {
		title: note.title,
		body: note.body,
	};

	const confirmed = useConfirmedForm({
		defaultValues,
		schema: noteEditFormSchema,
		run: (value): void =>
			noteUpdate.mutate(
				D.merge(value, { id: note.id, version: note.version }),
				{ onSuccess: () => void navigate({ to: "/notes" }) },
			),
	});

	return { ...confirmed, isPending: noteUpdate.isPending };
};
