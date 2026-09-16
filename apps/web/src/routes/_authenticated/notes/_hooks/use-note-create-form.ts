import { noteCreateInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useNoteCreate } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

type TCreateNoteFormValues = z.input<typeof noteCreateInputSchema>;

const DEFAULT_VALUES: TCreateNoteFormValues = { title: "", body: "" };

export const useNoteCreateForm = () => {
	const noteCreate = useNoteCreate();

	const confirm = useConfirmedAction<TCreateNoteFormValues>((value) =>
		noteCreate.mutate(
			{ title: value.title, body: value.body ?? "" },
			{ onSuccess: () => form.reset() },
		),
	);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: noteCreateInputSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, confirm };
};
