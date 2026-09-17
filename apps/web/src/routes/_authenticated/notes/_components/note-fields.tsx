import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
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
	<div className="flex flex-col gap-2">
		<div className="flex items-center justify-between">
			<Label htmlFor={props.id}>{NOTE_MESSAGE.COLUMN_TITLE}</Label>
			<FieldCounter length={props.value.length} max={NOTE_TITLE_MAX} />
		</div>
		<Input
			id={props.id}
			value={props.value}
			placeholder={NOTE_MESSAGE.TITLE_PLACEHOLDER}
			maxLength={NOTE_TITLE_MAX}
			autoFocus
			onBlur={props.onBlur}
			onChange={(event) => props.onChange(event.target.value)}
		/>
		<FieldError errors={props.errors} />
	</div>
);

export const NoteBodyField: FC<TNoteFieldProps> = (props): ReactElement => (
	<div className="flex flex-col gap-2">
		<div className="flex items-center justify-between">
			<Label htmlFor={props.id}>{NOTE_MESSAGE.COLUMN_BODY}</Label>
			<FieldCounter length={props.value.length} max={NOTE_BODY_MAX} />
		</div>
		<Textarea
			id={props.id}
			value={props.value}
			placeholder={NOTE_MESSAGE.BODY_PLACEHOLDER}
			maxLength={NOTE_BODY_MAX}
			className="min-h-56"
			onBlur={props.onBlur}
			onChange={(event) => props.onChange(event.target.value)}
		/>
		<FieldError errors={props.errors} />
	</div>
);
