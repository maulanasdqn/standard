import { noteCreateInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useNoteCreate } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TCreateNoteFormValues = z.input<typeof noteCreateInputSchema>;

const DEFAULT_VALUES: TCreateNoteFormValues = { title: "", body: "" };

export const useNoteCreateForm = () => {
	const noteCreate = useNoteCreate();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: noteCreateInputSchema },
		onSubmit: async ({ value, formApi }) => {
			await noteCreate.mutateAsync({
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
