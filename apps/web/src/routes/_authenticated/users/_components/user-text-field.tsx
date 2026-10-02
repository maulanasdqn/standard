import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
import type { FC, ReactElement } from "react";

type TUserTextFieldProps = {
	id: string;
	label: string;
	value: string;
	errors: readonly unknown[];
	type?: "text" | "email" | "password";
	placeholder?: string;
	autoComplete?: string;
	hint?: string;
	disabled?: boolean;
	onBlur: () => void;
	onChange: (value: string) => void;
};

export const UserTextField: FC<TUserTextFieldProps> = (props): ReactElement => {
	const { type = "text" } = props;

	return (
		<Field
			id={props.id}
			label={props.label}
			description={props.hint}
			errors={props.errors}
		>
			{(control): ReactElement => (
				<Input
					{...control}
					type={type}
					value={props.value}
					placeholder={props.placeholder}
					autoComplete={props.autoComplete}
					disabled={props.disabled}
					onBlur={props.onBlur}
					onChange={(event) => props.onChange(event.target.value)}
				/>
			)}
		</Field>
	);
};
