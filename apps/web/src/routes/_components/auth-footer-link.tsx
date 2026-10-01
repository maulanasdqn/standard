import { Link, type LinkProps } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";

type TAuthFooterLinkProps = {
	prompt?: string;
	label: string;
	to: LinkProps["to"];
};

export const AuthFooterLink: FC<TAuthFooterLinkProps> = (
	props,
): ReactElement => (
	<p className="text-center text-sm text-muted-foreground">
		{props.prompt}{" "}
		<Link
			to={props.to}
			className="font-medium text-foreground underline-offset-4 hover:underline"
		>
			{props.label}
		</Link>
	</p>
);
