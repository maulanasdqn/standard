import type { FC, ReactElement, ReactNode } from "react";

type TPageSkeletonProps = {
	label: string;
	children: ReactNode;
};

export const PageSkeleton: FC<TPageSkeletonProps> = (props): ReactElement => (
	<output
		aria-label={props.label}
		aria-busy
		className="flex w-full flex-col gap-6 animate-in fade-in-0 duration-300 motion-reduce:animate-none"
	>
		{props.children}
	</output>
);
