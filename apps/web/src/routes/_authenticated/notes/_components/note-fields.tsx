import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import { NOTE_MESSAGE } from "@app/messages";
import { NOTE_BODY_MAX, NOTE_TITLE_MAX } from "@app/schemas";
import type { FC, ReactElement } from "react";
import { FieldCounter } from "#/routes/_authenticated/_components/field-counter.tsx";

type TNoteFieldProps = {
	id: string;
	value: string;
	errors: readonly unknown[];
	onBlur: () => void;
	onChange: (value: string) => void;
};

export const NoteTitleField: FC<TNoteFieldProps> = (props): ReactElement => (
	<Field
		id={props.id}
		label={NOTE_MESSAGE.COLUMN_TITLE}
		labelAside={
			<FieldCounter length={props.value.length} max={NOTE_TITLE_MAX} />
		}
		errors={props.errors}
	>
		{(control): ReactElement => (
			<Input
				{...control}
				value={props.value}
				placeholder={NOTE_MESSAGE.TITLE_PLACEHOLDER}
				maxLength={NOTE_TITLE_MAX}
				autoFocus
				onBlur={props.onBlur}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		)}
	</Field>
);

export const NoteBodyField: FC<TNoteFieldProps> = (props): ReactElement => (
	<Field
		id={props.id}
		label={NOTE_MESSAGE.COLUMN_BODY}
		labelAside={
			<FieldCounter length={props.value.length} max={NOTE_BODY_MAX} />
		}
		errors={props.errors}
	>
		{(control): ReactElement => (
			<Textarea
				{...control}
				value={props.value}
				placeholder={NOTE_MESSAGE.BODY_PLACEHOLDER}
				maxLength={NOTE_BODY_MAX}
				className="min-h-56"
				onBlur={props.onBlur}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		)}
	</Field>
);
