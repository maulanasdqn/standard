import { roleCreateInputSchema } from "@app/schemas";
import { useNavigate } from "@tanstack/react-router";
import { D } from "@mobily/ts-belt";
import { useState } from "react";
import { match } from "ts-pattern";
import type { z } from "zod";
import {
	type TConfirmedForm,
	useConfirmedForm,
} from "#/routes/_authenticated/_hooks/use-confirmed-form.ts";
import { useRoleCreate } from "#/routes/_authenticated/roles/_hooks/use-roles.ts";
import {
	roleKeyDraft,
	roleKeyOf,
} from "#/routes/_authenticated/roles/_utils/role-key.ts";

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

type TRoleCreateForm = TConfirmedForm<
	TRoleCreateFormValues,
	typeof roleCreateInputSchema
> & {
	isPending: boolean;
	onLabelChange: (label: string) => void;
	onKeyChange: (key: string) => void;
	onKeyBlur: () => void;
};

export const useRoleCreateForm = (): TRoleCreateForm => {
	const roleCreate = useRoleCreate();
	const navigate = useNavigate();

	const confirmed = useConfirmedForm({
		defaultValues: DEFAULT_VALUES,
		schema: roleCreateInputSchema,
		run: (value): void =>
			roleCreate.mutate(payloadBuild(value), {
				onSuccess: () => void navigate({ to: "/roles" }),
			}),
	});

	const [keyEdited, setKeyEdited] = useState(false);
	const { form } = confirmed;

	const onLabelChange = (label: string): void => {
		form.setFieldValue("label", label);
		form.setFieldValue(
			"key",
			keyEdited ? form.getFieldValue("key") : roleKeyOf(label),
		);
	};

	const onKeyChange = (key: string): void => {
		const draft = roleKeyDraft(key);
		setKeyEdited(draft !== "");
		form.setFieldValue("key", draft);
	};

	const onKeyBlur = (): void => {
		form.setFieldValue("key", roleKeyOf(form.getFieldValue("key")));
	};

	return {
		...confirmed,
		isPending: roleCreate.isPending,
		onLabelChange,
		onKeyChange,
		onKeyBlur,
	};
};
