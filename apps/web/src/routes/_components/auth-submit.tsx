import { Button } from "@app/components/ui/button";
import { Loader2 } from "lucide-react";
import type { FC, ReactElement } from "react";

type TAuthSubmitProps = {
	pending: boolean;
	label: string;
	pendingLabel: string;
};

export const AuthSubmit: FC<TAuthSubmitProps> = (props): ReactElement => (
	<Button type="submit" className="w-full" disabled={props.pending}>
		{props.pending && <Loader2 className="animate-spin" />}
		{props.pending ? props.pendingLabel : props.label}
	</Button>
);
