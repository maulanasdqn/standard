import { AUTH_MESSAGE } from "@app/messages";
import { profileUpdateInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { match, P } from "ts-pattern";
import type { z } from "zod";
import { authClient } from "#/libs/auth/client.ts";
import { sessionRefresh } from "#/libs/auth/session.ts";
import { useSession } from "#/libs/auth/use-session.ts";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";

type TProfileValues = z.input<typeof profileUpdateInputSchema>;

export type TProfileForm = TFormHook<
	TSchemaForm<TProfileValues, typeof profileUpdateInputSchema>
>;

export const useProfileForm = (): TProfileForm => {
	const session = useSession();

	const form = useForm({
		defaultValues: { name: session?.user.name ?? "" },
		validators: {
			onBlur: profileUpdateInputSchema,
			onSubmit: profileUpdateInputSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			const { error } = await authClient.updateUser({
				name: value.name.trim(),
			});
			await match(error)
				.with(P.nullish, async (): Promise<void> => {
					await sessionRefresh();
					formApi.reset({ name: value.name.trim() });
					toast.success(AUTH_MESSAGE.PROFILE_SAVED);
				})
				.otherwise(async (): Promise<void> => {
					toast.error(AUTH_MESSAGE.PROFILE_SAVE_FAILED);
				});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit };
};
