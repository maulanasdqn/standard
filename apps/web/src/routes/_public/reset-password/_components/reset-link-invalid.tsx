import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { Button } from "@app/components/ui/button";
import { AUTH_MESSAGE } from "@app/messages";
import { Link } from "@tanstack/react-router";
import { LinkIcon } from "lucide-react";
import type { FC, ReactElement } from "react";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";

export const ResetLinkInvalid: FC = (): ReactElement => (
	<Stagger className="flex flex-col items-center gap-6 text-center">
		<StaggerItem>
			<div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
				<LinkIcon className="size-6" />
			</div>
		</StaggerItem>
		<StaggerItem>
			<AuthHeading
				title={AUTH_MESSAGE.RESET_TITLE}
				description={AUTH_MESSAGE.RESET_LINK_INVALID}
			/>
		</StaggerItem>
		<StaggerItem className="w-full">
			<Button asChild className="w-full">
				<Link to="/forgot-password">{AUTH_MESSAGE.REQUEST_NEW_LINK}</Link>
			</Button>
		</StaggerItem>
		<StaggerItem>
			<AuthFooterLink label={AUTH_MESSAGE.BACK_TO_SIGN_IN} to="/login" />
		</StaggerItem>
	</Stagger>
);
