import { userListInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
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
		},
		onSubmit: ({ value: values }) => onChange(values.search ?? ""),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit };
};
