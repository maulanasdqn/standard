import { userListInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { SEARCH_DEBOUNCE_MS } from "#/libs/forms/search-debounce.ts";
import { useUserSearch } from "#/routes/_authenticated/users/_hooks/use-users.ts";

const userSearchFormSchema = userListInputSchema.pick({ search: true });

type TUserSearchFormValues = z.input<typeof userSearchFormSchema>;

export const useUserSearchForm = () => {
	const { value, onChange } = useUserSearch();
	const defaultValues: TUserSearchFormValues = { search: value };

	const form = useForm({
		defaultValues,
		validators: { onChange: userSearchFormSchema },
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
