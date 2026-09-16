import { roleUpdateInputSchema, type TRoleDto } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { match } from "ts-pattern";
import type { z } from "zod";
import { useRoleUpdate } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import { useConfirmedAction } from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

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

	const confirm = useConfirmedAction<TRoleEditFormValues>((value) => {
		const description = match(value.description)
			.with("", () => null)
			.otherwise((text) => text);

		roleUpdate.mutate(D.merge(value, { key: role.key, description }), {
			onSuccess: () => void navigate({ to: "/roles" }),
		});
	});

	const form = useForm({
		defaultValues,
		validators: { onChange: roleEditFormSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return {
		form,
		onSubmit,
		confirm,
		isPending: roleUpdate.isPending,
		isFixed: role.fixed,
	};
};
