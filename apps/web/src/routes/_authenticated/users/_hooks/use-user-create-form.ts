import { ROLE } from "@app/permissions";
import { userCreateInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useUserCreate } from "#/routes/_authenticated/users/_hooks/use-users.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

type TUserCreateFormValues = z.input<typeof userCreateInputSchema>;

const DEFAULT_VALUES: TUserCreateFormValues = {
	name: "",
	email: "",
	password: "",
	role: ROLE.VIEWER,
};

export const useUserCreateForm = () => {
	const userCreate = useUserCreate();

	const confirm = useConfirmedAction<TUserCreateFormValues>((value) =>
		userCreate.mutate(value, { onSuccess: () => form.reset() }),
	);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: userCreateInputSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, confirm, isPending: userCreate.isPending };
};
