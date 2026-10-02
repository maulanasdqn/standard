import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
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
	<Field
		id={props.id}
		label={props.label}
		labelAside={props.labelAside}
		description={props.hint}
		errorMap={props.errorMap}
	>
		{(control): ReactElement => (
			<Input
				{...control}
				type={props.type}
				autoComplete={props.autoComplete}
				placeholder={props.placeholder}
				value={props.value}
				onBlur={props.onBlur}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		)}
	</Field>
);
