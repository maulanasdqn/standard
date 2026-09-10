import { roleCreateInputSchema } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { match } from "ts-pattern";
import type { z } from "zod";
import { useRoleCreate } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";

type TRoleCreateFormValues = z.input<typeof roleCreateInputSchema>;

const DEFAULT_VALUES: TRoleCreateFormValues = {
	key: "",
	label: "",
	description: "",
	permissions: [],
};

const payloadBuild = (value: TRoleCreateFormValues): TRoleCreateFormValues =>
	match(value.description)
		.with("", () => D.deleteKey(value, "description"))
		.otherwise(() => value);

export const useRoleCreateForm = () => {
	const roleCreate = useRoleCreate();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: roleCreateInputSchema },
		onSubmit: ({ value, formApi }) => {
			roleCreate.mutate(payloadBuild(value), {
				onSuccess: () => formApi.reset(),
			});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, isPending: roleCreate.isPending };
};
