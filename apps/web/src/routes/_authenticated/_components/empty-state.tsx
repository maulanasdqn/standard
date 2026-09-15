import type { FC, ReactElement } from "react";

type TEmptyStateProps = {
	message: string;
};

export const EmptyState: FC<TEmptyStateProps> = (props): ReactElement => (
	<output className="text-sm text-neutral-500">{props.message}</output>
);
