import { roleUpdateInputSchema, type TRoleDto } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import type { z } from "zod";
import { useRoleUpdate } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

const roleEditFormSchema = roleUpdateInputSchema.omit({ key: true }).required();

type TRoleEditFormValues = z.input<typeof roleEditFormSchema>;

export const useRoleEditForm = (role: TRoleDto) => {
	const navigate = useNavigate();
	const roleUpdate = useRoleUpdate();

	const defaultValues: TRoleEditFormValues = {
		label: role.label,
		description: role.description ?? "",
		permissions: [...role.permissions],
	};

	const form = useForm({
		defaultValues,
		validators: { onChange: roleEditFormSchema },
		onSubmit: ({ value }) => {
			roleUpdate.mutate(D.merge(value, { key: role.key }), {
				onSuccess: () => void navigate({ to: "/roles" }),
			});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return {
		form,
		onSubmit,
		isPending: roleUpdate.isPending,
		isFixed: role.fixed,
	};
};
