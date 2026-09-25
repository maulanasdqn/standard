import { noteCreateInputSchema } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import type { z } from "zod";
import {
	type TConfirmedForm,
	useConfirmedForm,
} from "#/routes/_authenticated/_hooks/use-confirmed-form.ts";
import { useNoteCreate } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

type TCreateNoteFormValues = z.input<typeof noteCreateInputSchema>;

const DEFAULT_VALUES: TCreateNoteFormValues = { title: "", body: "" };

type TNoteCreateForm = TConfirmedForm<
	TCreateNoteFormValues,
	typeof noteCreateInputSchema
> & {
	isPending: boolean;
};

export const useNoteCreateForm = (): TNoteCreateForm => {
	const navigate = useNavigate();
	const noteCreate = useNoteCreate();

	const confirmed = useConfirmedForm({
		defaultValues: DEFAULT_VALUES,
		schema: noteCreateInputSchema,
		run: (value): void =>
			noteCreate.mutate(
				{ title: value.title, body: value.body ?? "" },
				{ onSuccess: () => void navigate({ to: "/notes" }) },
			),
	});

	return { ...confirmed, isPending: noteCreate.isPending };
};
