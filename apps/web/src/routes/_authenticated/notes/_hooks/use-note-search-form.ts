import { noteListInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useNoteSearch } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteSearchFormSchema = noteListInputSchema.pick({ search: true });

type TNoteSearchFormValues = z.input<typeof noteSearchFormSchema>;

export const useNoteSearchForm = () => {
	const { value, onChange } = useNoteSearch();
	const defaultValues: TNoteSearchFormValues = { search: value };

	const form = useForm({
		defaultValues,
		validators: { onChange: noteSearchFormSchema },
		listeners: {
			onChange: ({ formApi }) => onChange(formApi.state.values.search ?? ""),
		},
		onSubmit: ({ value: values }) => onChange(values.search ?? ""),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit };
};
