import type { FC, ReactElement } from "react";

type TAuthHeadingProps = {
	title: string;
	description: string;
};

export const AuthHeading: FC<TAuthHeadingProps> = (props): ReactElement => (
	<div className="flex flex-col items-center gap-2 text-center">
		<h1 className="text-2xl font-bold">{props.title}</h1>
		<p className="text-sm text-balance text-muted-foreground">
			{props.description}
		</p>
	</div>
);
