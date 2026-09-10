import { type TUser, userPasswordResetInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useUserPasswordReset } from "#/routes/_authenticated/users/_hooks/use-users.ts";

const userPasswordResetFormSchema = userPasswordResetInputSchema.pick({
	password: true,
});

type TUserPasswordResetFormValues = z.input<typeof userPasswordResetFormSchema>;

const DEFAULT_VALUES: TUserPasswordResetFormValues = { password: "" };

export const useUserPasswordResetForm = (user: TUser) => {
	const passwordReset = useUserPasswordReset();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: userPasswordResetFormSchema },
		onSubmit: ({ value, formApi }) => {
			passwordReset.mutate(
				{ id: user.id, password: value.password },
				{ onSuccess: () => formApi.reset() },
			);
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, isPending: passwordReset.isPending };
};
