import { AUTH_MESSAGE } from "@app/messages";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { verificationResend } from "#/libs/auth/verification-resend.ts";

export type TVerificationResend = {
	pending: boolean;
	resend: () => void;
};

export const useVerificationResend = (email: string): TVerificationResend => {
	const mutation = useMutation({
		mutationFn: (): Promise<void> => verificationResend(email),
		onSuccess: (): void => {
			toast.success(AUTH_MESSAGE.VERIFICATION_RESENT);
		},
		onError: (): void => {
			toast.error(AUTH_MESSAGE.VERIFICATION_RESEND_FAILED);
		},
	});

	return { pending: mutation.isPending, resend: () => mutation.mutate() };
};
