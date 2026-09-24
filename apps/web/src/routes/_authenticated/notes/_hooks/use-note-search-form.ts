import { noteListInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import type { TFormHook, TValidatedForm } from "#/libs/forms/form-hook.ts";
import { SEARCH_DEBOUNCE_MS } from "#/libs/forms/search-debounce.ts";
import { useNoteSearch } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

const noteSearchFormSchema = noteListInputSchema.pick({ search: true });

type TNoteSearchFormValues = z.input<typeof noteSearchFormSchema>;

type TNoteSearchForm = TFormHook<
	TValidatedForm<TNoteSearchFormValues, typeof noteSearchFormSchema>
>;

export const useNoteSearchForm = (): TNoteSearchForm => {
	const { value, onChange } = useNoteSearch();
	const defaultValues: TNoteSearchFormValues = { search: value };

	const form = useForm({
		defaultValues,
		validators: { onChange: noteSearchFormSchema },
		listeners: {
			onChange: ({ formApi }) => onChange(formApi.state.values.search ?? ""),
			onChangeDebounceMs: SEARCH_DEBOUNCE_MS,
		},
		onSubmit: ({ value: values }) => onChange(values.search ?? ""),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit };
};
