import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { Button } from "@app/components/ui/button";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { FC, ReactElement } from "react";
import { cn } from "@app/components/lib/utils";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";

type TVerifyEmailResultProps = {
	icon: LucideIcon;
	tone: string;
	title: string;
	description: string;
	actionLabel: string;
	actionTo: LinkProps["to"];
};

export const VerifyEmailResult: FC<TVerifyEmailResultProps> = (
	props,
): ReactElement => (
	<Stagger className="flex flex-col items-center gap-6 text-center">
		<StaggerItem>
			<div
				className={cn(
					"flex size-12 items-center justify-center rounded-full",
					props.tone,
				)}
			>
				<props.icon className="size-6" />
			</div>
		</StaggerItem>
		<StaggerItem>
			<AuthHeading title={props.title} description={props.description} />
		</StaggerItem>
		<StaggerItem className="w-full">
			<Button asChild className="w-full">
				<Link to={props.actionTo}>{props.actionLabel}</Link>
			</Button>
		</StaggerItem>
	</Stagger>
);
