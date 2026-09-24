import { ROLE } from "@app/permissions";
import { userCreateInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useUserCreate } from "#/routes/_authenticated/users/_hooks/use-users.ts";
import type { TFormHook, TValidatedForm } from "#/libs/forms/form-hook.ts";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

type TUserCreateFormValues = z.input<typeof userCreateInputSchema>;

const DEFAULT_VALUES: TUserCreateFormValues = {
	name: "",
	email: "",
	password: "",
	role: ROLE.VIEWER,
};

type TUserCreateForm = TFormHook<
	TValidatedForm<TUserCreateFormValues, typeof userCreateInputSchema>
> & {
	confirm: TConfirmedAction<TUserCreateFormValues>;
	isPending: boolean;
};

export const useUserCreateForm = (): TUserCreateForm => {
	const navigate = useNavigate();
	const userCreate = useUserCreate();

	const confirm = useConfirmedAction<TUserCreateFormValues>((value) =>
		userCreate.mutate(value, {
			onSuccess: () => void navigate({ to: "/users" }),
		}),
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
