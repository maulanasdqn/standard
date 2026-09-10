import { type TUser, userUpdateInputSchema } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import type { z } from "zod";
import {
	useIsSelf,
	useUserUpdate,
} from "#/routes/_authenticated/users/_hooks/use-users.ts";

const userEditFormSchema = userUpdateInputSchema
	.pick({ name: true, role: true })
	.required();

type TUserEditFormValues = z.input<typeof userEditFormSchema>;

export const useUserEditForm = (user: TUser) => {
	const navigate = useNavigate();
	const userUpdate = useUserUpdate();
	const isSelf = useIsSelf()(user.id);

	const defaultValues: TUserEditFormValues = {
		name: user.name,
		role: user.role,
	};

	const form = useForm({
		defaultValues,
		validators: { onChange: userEditFormSchema },
		onSubmit: ({ value }) => {
			userUpdate.mutate(D.merge(value, { id: user.id }), {
				onSuccess: () => void navigate({ to: "/users" }),
			});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, isPending: userUpdate.isPending, isSelf };
};
