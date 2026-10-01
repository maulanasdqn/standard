import { Button } from "@app/components/ui/button";
import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { AUTH_MESSAGE } from "@app/messages";
import { MailCheck } from "lucide-react";
import type { FC, ReactElement } from "react";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { useVerificationResend } from "#/routes/_public/register/_hooks/use-verification-resend.ts";

type TCheckEmailProps = {
	email: string;
};

export const CheckEmail: FC<TCheckEmailProps> = (props): ReactElement => {
	const verification = useVerificationResend(props.email);

	return (
		<Stagger className="flex flex-col items-center gap-6 text-center">
			<StaggerItem>
				<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<MailCheck className="size-6" />
				</div>
			</StaggerItem>
			<StaggerItem>
				<AuthHeading
					title={AUTH_MESSAGE.CHECK_EMAIL_TITLE}
					description={AUTH_MESSAGE.CHECK_EMAIL_DESCRIPTION}
				/>
			</StaggerItem>
			<StaggerItem>
				<p className="font-medium">{props.email}</p>
			</StaggerItem>
			<StaggerItem className="w-full">
				<Button
					variant="outline"
					className="w-full"
					disabled={verification.pending}
					onClick={verification.resend}
				>
					{AUTH_MESSAGE.VERIFICATION_RESEND}
				</Button>
			</StaggerItem>
			<StaggerItem>
				<AuthFooterLink label={AUTH_MESSAGE.BACK_TO_SIGN_IN} to="/login" />
			</StaggerItem>
		</Stagger>
	);
};
