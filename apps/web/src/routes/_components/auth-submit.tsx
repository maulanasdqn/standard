import { Button } from "@app/components/ui/button";
import type { FC, ReactElement } from "react";

type TAuthSubmitProps = {
	pending: boolean;
	label: string;
	pendingLabel: string;
};

export const AuthSubmit: FC<TAuthSubmitProps> = (props): ReactElement => (
	<Button type="submit" className="w-full" pending={props.pending}>
		{props.pending ? props.pendingLabel : props.label}
	</Button>
);
