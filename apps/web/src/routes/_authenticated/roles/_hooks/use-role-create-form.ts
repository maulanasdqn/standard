import { roleCreateInputSchema } from "@app/schemas";
import { D } from "@mobily/ts-belt";
import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { match } from "ts-pattern";
import type { z } from "zod";
import { useRoleCreate } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import type { TFormHook, TValidatedForm } from "#/libs/forms/form-hook.ts";
import {
	type TConfirmedAction,
	useConfirmedAction,
} from "#/routes/_authenticated/_hooks/use-confirmed-action.ts";

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

type TRoleCreateForm = TFormHook<
	TValidatedForm<TRoleCreateFormValues, typeof roleCreateInputSchema>
> & {
	confirm: TConfirmedAction<TRoleCreateFormValues>;
	isPending: boolean;
};

export const useRoleCreateForm = (): TRoleCreateForm => {
	const roleCreate = useRoleCreate();

	const confirm = useConfirmedAction<TRoleCreateFormValues>((value) =>
		roleCreate.mutate(payloadBuild(value), { onSuccess: () => form.reset() }),
	);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: roleCreateInputSchema },
		onSubmit: ({ value }) => confirm.request(value),
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, onSubmit, confirm, isPending: roleCreate.isPending };
};
