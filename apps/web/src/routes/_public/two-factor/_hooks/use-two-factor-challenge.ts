import { twoFactorCodeInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { match, P } from "ts-pattern";
import type { z } from "zod";
import {
	type TAuthError,
	twoFactorErrorMessage,
} from "#/libs/auth/auth-error.ts";
import { authClient } from "#/libs/auth/client.ts";
import { returnToResolve } from "#/libs/auth/return-to.ts";
import { sessionRefresh } from "#/libs/auth/session.ts";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";

const challengeRouteApi = getRouteApi("/_public/two-factor/");

type TChallengeValues = z.input<typeof twoFactorCodeInputSchema>;

const DEFAULT_VALUES: TChallengeValues = { code: "", trustDevice: false };

export type TTwoFactorChallenge = TFormHook<
	TSchemaForm<TChallengeValues, typeof twoFactorCodeInputSchema>
> & {
	serverError: string | null;
	useBackupCode: boolean;
	toggleMethod: () => void;
};

type TVerifyResult = { error: TAuthError | null };

const verify = (
	useBackupCode: boolean,
	value: TChallengeValues,
): Promise<TVerifyResult> =>
	useBackupCode
		? authClient.twoFactor.verifyBackupCode({
				code: value.code.trim(),
				trustDevice: value.trustDevice,
			})
		: authClient.twoFactor.verifyTotp({
				code: value.code.trim(),
				trustDevice: value.trustDevice,
			});

export const useTwoFactorChallenge = (): TTwoFactorChallenge => {
	const navigate = useNavigate();
	const { redirect } = challengeRouteApi.useSearch();
	const [serverError, setServerError] = useState<string | null>(null);
	const [useBackupCode, setUseBackupCode] = useState(false);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onBlur: twoFactorCodeInputSchema,
			onSubmit: twoFactorCodeInputSchema,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await verify(useBackupCode, value);
			await match(error)
				.with(P.nullish, async (): Promise<void> => {
					await sessionRefresh();
					await navigate({ href: returnToResolve(redirect) });
				})
				.otherwise(
					async (found): Promise<void> =>
						setServerError(twoFactorErrorMessage(found)),
				);
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return {
		form,
		onSubmit,
		serverError,
		useBackupCode,
		toggleMethod: (): void => {
			setServerError(null);
			form.setFieldValue("code", "");
			setUseBackupCode((current) => !current);
		},
	};
};
