import { type TNote, noteUpdateInputSchema } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";
import { useNoteUpdate } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteEditFormSchema = noteUpdateInputSchema
	.pick({ title: true, body: true })
	.required();

type TNoteEditFormValues = z.input<typeof noteEditFormSchema>;

export const useNoteEditForm = (note: TNote) => {
	const navigate = useNavigate();
	const noteUpdate = useNoteUpdate();

	const defaultValues: TNoteEditFormValues = {
		title: note.title,
		body: note.body,
	};

	const confirm = useConfirmedAction<TNoteEditFormValues>((value) =>
		noteUpdate.mutate(D.merge(value, { id: note.id, version: note.version }), {
			onSuccess: () => void navigate({ to: "/notes" }),
		}),
	);

	const form = useForm({
		defaultValues,
		validators: { onChange: noteEditFormSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, confirm, isPending: noteUpdate.isPending };
};
