import { ROLE } from "@app/permissions";
import { userInviteInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import type { z } from "zod";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";
import { useUserInvite } from "#/routes/_authenticated/users/_hooks/use-user-admin.ts";

type TUserInviteValues = z.input<typeof userInviteInputSchema>;

const DEFAULT_VALUES: TUserInviteValues = {
	name: "",
	email: "",
	role: ROLE.VIEWER,
};

export type TUserInviteForm = TFormHook<
	TSchemaForm<TUserInviteValues, typeof userInviteInputSchema>
> & {
	isPending: boolean;
};

export const useUserInviteForm = (): TUserInviteForm => {
	const navigate = useNavigate();
	const userInvite = useUserInvite();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onBlur: userInviteInputSchema,
			onSubmit: userInviteInputSchema,
		},
		onSubmit: ({ value }): void =>
			userInvite.mutate(value, {
				onSuccess: () => void navigate({ to: "/users" }),
			}),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, isPending: userInvite.isPending };
};
