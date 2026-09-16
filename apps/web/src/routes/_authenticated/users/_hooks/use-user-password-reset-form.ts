import { type TUser, userPasswordResetInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useUserPasswordReset } from "#/routes/_authenticated/users/_hooks/use-users.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

const userPasswordResetFormSchema = userPasswordResetInputSchema.pick({
	password: true,
});

type TUserPasswordResetFormValues = z.input<typeof userPasswordResetFormSchema>;

const DEFAULT_VALUES: TUserPasswordResetFormValues = { password: "" };

export const useUserPasswordResetForm = (user: TUser) => {
	const passwordReset = useUserPasswordReset();

	const confirm = useConfirmedAction<TUserPasswordResetFormValues>((value) =>
		passwordReset.mutate(
			{ id: user.id, password: value.password },
			{ onSuccess: () => form.reset() },
		),
	);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: userPasswordResetFormSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, confirm, isPending: passwordReset.isPending };
};
