import { createNoteInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useCreateNote } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TCreateNoteFormValues = z.input<typeof createNoteInputSchema>;

const DEFAULT_VALUES: TCreateNoteFormValues = { title: "", body: "" };

export const useCreateNoteForm = () => {
	const createNote = useCreateNote();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: createNoteInputSchema },
		onSubmit: async ({ value, formApi }) => {
			await createNote.mutateAsync({
				title: value.title,
				body: value.body ?? "",
			});
			formApi.reset();
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit };
};
