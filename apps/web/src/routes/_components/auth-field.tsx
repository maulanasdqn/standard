import { FieldError, hasFieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import type {
	FC,
	HTMLInputTypeAttribute,
	ReactElement,
	ReactNode,
} from "react";

type TAuthFieldProps = {
	id: string;
	label: string;
	type: HTMLInputTypeAttribute;
	placeholder: string;
	value: string;
	errorMap: Partial<Record<string, unknown>>;
	autoComplete?: string;
	hint?: string;
	labelAside?: ReactNode;
	onBlur: () => void;
	onChange: (value: string) => void;
};

export const AuthField: FC<TAuthFieldProps> = (props): ReactElement => (
	<div className="grid gap-1.5">
		<div className="flex items-center justify-between gap-2">
			<Label htmlFor={props.id}>{props.label}</Label>
			{props.labelAside}
		</div>
		<Input
			id={props.id}
			type={props.type}
			autoComplete={props.autoComplete}
			placeholder={props.placeholder}
			aria-invalid={hasFieldError(props.errorMap)}
			value={props.value}
			onBlur={props.onBlur}
			onChange={(event) => props.onChange(event.target.value)}
		/>
		{props.hint && (
			<p className="text-xs text-muted-foreground">{props.hint}</p>
		)}
		<FieldError errorMap={props.errorMap} />
	</div>
);
