import { AUTH_MESSAGE } from "@app/messages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { match, P } from "ts-pattern";
import { authClient } from "#/libs/auth/client.ts";
import {
	TWO_FACTOR_ACTION,
	TWO_FACTOR_STEP,
	type TTwoFactorAction,
	type TTwoFactorStep,
} from "#/routes/_authenticated/account/_constants/two-factor.ts";

const TWO_FACTOR_STATUS_KEY = ["auth", "two-factor-status"] as const;
const TOTP_SECRET_PARAM = "secret";

export type TOwnTwoFactor = {
	enabled: boolean;
	step: TTwoFactorStep;
	action: TTwoFactorAction;
	totpUri: string;
	manualKey: string;
	backupCodes: readonly string[];
	pending: boolean;
	password: string;
	code: string;
	onPasswordChange: (value: string) => void;
	onCodeChange: (value: string) => void;
	start: (action: TTwoFactorAction) => void;
	cancel: () => void;
	submitPassword: () => void;
	verifySetup: () => void;
	finish: () => void;
};

const failureToast = (): void => {
	toast.error(AUTH_MESSAGE.TWO_FACTOR_FAILED);
};

const statusFetch = async (): Promise<boolean> => {
	const { data } = await authClient.getSession();
	return data?.user.twoFactorEnabled === true;
};

const whenOk = (error: unknown, then: () => Promise<void>): Promise<boolean> =>
	match(error)
		.with(P.nullish, async (): Promise<boolean> => {
			await then();
			return true;
		})
		.otherwise(async (): Promise<boolean> => false);

const manualKeyOf = (uri: string): string =>
	uri === "" ? "" : (new URL(uri).searchParams.get(TOTP_SECRET_PARAM) ?? "");

export const useOwnTwoFactor = (): TOwnTwoFactor => {
	const queryClient = useQueryClient();
	const status = useQuery({
		queryKey: TWO_FACTOR_STATUS_KEY,
		queryFn: statusFetch,
	});
	const [step, setStep] = useState<TTwoFactorStep>(TWO_FACTOR_STEP.IDLE);
	const [action, setAction] = useState<TTwoFactorAction>(
		TWO_FACTOR_ACTION.ENABLE,
	);
	const [totpUri, setTotpUri] = useState("");
	const [backupCodes, setBackupCodes] = useState<readonly string[]>([]);
	const [pending, setPending] = useState(false);
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");

	const refresh = (): Promise<void> =>
		queryClient.invalidateQueries({ queryKey: TWO_FACTOR_STATUS_KEY });

	const reset = (): void => {
		setPassword("");
		setCode("");
		setStep(TWO_FACTOR_STEP.IDLE);
		setTotpUri("");
		setBackupCodes([]);
	};

	const run = async (work: () => Promise<boolean>): Promise<void> => {
		setPending(true);
		const succeeded = await work().catch((): boolean => false);
		setPending(false);
		return succeeded ? undefined : failureToast();
	};

	const passwordWork = (password: string): Promise<boolean> =>
		match(action)
			.with(TWO_FACTOR_ACTION.ENABLE, async (): Promise<boolean> => {
				const { data, error } = await authClient.twoFactor.enable({ password });
				const setup = match(data)
					.with(
						{ totpURI: P.string, backupCodes: P.array(P.string) },
						(found) => found,
					)
					.otherwise(() => null);
				setTotpUri(setup?.totpURI ?? "");
				setBackupCodes(setup?.backupCodes ?? []);
				setStep(error ? TWO_FACTOR_STEP.PASSWORD : TWO_FACTOR_STEP.SETUP);
				return !error;
			})
			.with(TWO_FACTOR_ACTION.REGENERATE, async (): Promise<boolean> => {
				const { data, error } = await authClient.twoFactor.generateBackupCodes({
					password,
				});
				setBackupCodes(data?.backupCodes ?? []);
				setStep(error ? TWO_FACTOR_STEP.PASSWORD : TWO_FACTOR_STEP.CODES);
				return !error;
			})
			.with(TWO_FACTOR_ACTION.DISABLE, async (): Promise<boolean> => {
				const { error } = await authClient.twoFactor.disable({ password });
				return whenOk(error, async (): Promise<void> => {
					await refresh();
					reset();
					toast.success(AUTH_MESSAGE.TWO_FACTOR_DISABLED);
				});
			})
			.exhaustive();

	return {
		enabled: status.data === true,
		step,
		action,
		totpUri,
		manualKey: manualKeyOf(totpUri),
		backupCodes,
		pending,
		password,
		code,
		onPasswordChange: setPassword,
		onCodeChange: setCode,
		start: (next: TTwoFactorAction): void => {
			setAction(next);
			setStep(TWO_FACTOR_STEP.PASSWORD);
		},
		cancel: reset,
		submitPassword: (): void => void run(() => passwordWork(password)),
		verifySetup: (): void =>
			void run(async (): Promise<boolean> => {
				const { error } = await authClient.twoFactor.verifyTotp({
					code: code.trim(),
				});
				return whenOk(error, async (): Promise<void> => {
					await refresh();
					setStep(TWO_FACTOR_STEP.CODES);
					toast.success(AUTH_MESSAGE.TWO_FACTOR_ENABLED);
				});
			}),
		finish: reset,
	};
};
