import { AUTH_MESSAGE } from "@app/messages";
import { passwordChangeInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { match, P } from "ts-pattern";
import { z } from "zod";
import { authClient } from "#/libs/auth/client.ts";
import { passwordChangeError } from "#/routes/_authenticated/account/_stores/password-change-error-store.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

const passwordChangeFormSchema = passwordChangeInputSchema
	.extend({ confirmPassword: z.string() })
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: AUTH_MESSAGE.PASSWORDS_MISMATCH,
		path: ["confirmPassword"],
	});

type TPasswordChangeFormValues = z.input<typeof passwordChangeFormSchema>;

const DEFAULT_VALUES: TPasswordChangeFormValues = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

export const usePasswordChangeForm = () => {
	const serverError = useSelector(passwordChangeError.store);

	const passwordChange = async (
		value: TPasswordChangeFormValues,
	): Promise<void> => {
		passwordChangeError.clear();
		const { error } = await authClient.changePassword({
			currentPassword: value.currentPassword,
			newPassword: value.newPassword,
			revokeOtherSessions: true,
		});

		match(error)
			.with(P.nullish, () => {
				toast.success(AUTH_MESSAGE.PASSWORD_CHANGED);
				form.reset();
			})
			.otherwise((found) => {
				passwordChangeError.set(
					found.message ?? AUTH_MESSAGE.PASSWORD_CHANGE_FAILED,
				);
			});
	};

	const confirm = useConfirmedAction<TPasswordChangeFormValues>(
		(value) => void passwordChange(value),
	);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: passwordChangeFormSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, onSubmit, confirm };
};
