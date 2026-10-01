import { AUTH_MESSAGE } from "@app/messages";
import { verifyEmailSearchSchema } from "@app/schemas";
import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, CircleX } from "lucide-react";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { useSession } from "#/libs/auth/use-session.ts";
import { AuthLayout } from "#/routes/_components/auth-layout.tsx";
import { VerifyEmailResult } from "#/routes/verify-email/_components/verify-email-result.tsx";

const VerifyEmailPage: FC = (): ReactElement => {
	const search = Route.useSearch();
	const signedIn = useSession() !== null;

	return (
		<AuthLayout>
			{match(search.error)
				.with(P.string, () => (
					<VerifyEmailResult
						icon={CircleX}
						tone="bg-destructive/10 text-destructive"
						title={AUTH_MESSAGE.VERIFY_FAILED_TITLE}
						description={AUTH_MESSAGE.VERIFY_FAILED_DESCRIPTION}
						actionLabel={AUTH_MESSAGE.SIGN_IN_LINK}
						actionTo="/login"
					/>
				))
				.otherwise(() => (
					<VerifyEmailResult
						icon={CircleCheck}
						tone="bg-emerald-500/10 text-emerald-500"
						title={AUTH_MESSAGE.VERIFY_SUCCESS_TITLE}
						description={AUTH_MESSAGE.VERIFY_SUCCESS_DESCRIPTION}
						actionLabel={
							signedIn ? AUTH_MESSAGE.CONTINUE : AUTH_MESSAGE.SIGN_IN_LINK
						}
						actionTo={signedIn ? "/dashboard" : "/login"}
					/>
				))}
		</AuthLayout>
	);
};

export const Route = createFileRoute("/verify-email/")({
	validateSearch: verifyEmailSearchSchema,
	component: VerifyEmailPage,
});
