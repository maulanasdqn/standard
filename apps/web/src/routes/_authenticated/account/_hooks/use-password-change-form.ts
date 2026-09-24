import { AUTH_MESSAGE } from "@app/messages";
import { passwordChangeInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { match, P } from "ts-pattern";
import { z } from "zod";
import { passwordChangeErrorMessage } from "#/libs/auth/auth-error.ts";
import { authClient } from "#/libs/auth/client.ts";
import { passwordChangeError } from "#/routes/_authenticated/account/_stores/password-change-error-store.ts";
import type { TFormHook, TValidatedForm } from "#/libs/forms/form-hook.ts";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

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

type TPasswordChangeForm = TFormHook<
	TValidatedForm<TPasswordChangeFormValues, typeof passwordChangeFormSchema>
> & {
	serverError: string | null;
	confirm: TConfirmedAction<TPasswordChangeFormValues>;
	isPending: boolean;
};

export const usePasswordChangeForm = (): TPasswordChangeForm => {
	const serverError = useSelector(passwordChangeError.store);

	const passwordChange = useMutation({
		mutationFn: (value: TPasswordChangeFormValues) =>
			authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: true,
			}),
		onMutate: (): void => passwordChangeError.clear(),
		onSuccess: ({ error }): void => {
			match(error)
				.with(P.nullish, (): void => {
					toast.success(AUTH_MESSAGE.PASSWORD_CHANGED);
					form.reset();
				})
				.otherwise((found): void => {
					passwordChangeError.set(passwordChangeErrorMessage(found));
				});
		},
		onError: (): void => {
			passwordChangeError.set(AUTH_MESSAGE.PASSWORD_CHANGE_FAILED);
		},
	});

	const confirm = useConfirmedAction<TPasswordChangeFormValues>((value) =>
		passwordChange.mutate(value),
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

	return {
		form,
		serverError,
		onSubmit,
		confirm,
		isPending: passwordChange.isPending,
	};
};
