import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { APP_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import type { TNote } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import { useNoteEditForm } from "#/routes/_authenticated/notes/_hooks/use-note-edit-form.ts";

type TNoteEditFormProps = {
	note: TNote;
};

export const NoteEditForm: FC<TNoteEditFormProps> = (props): ReactElement => {
	const { form, onSubmit, confirm, isPending } = useNoteEditForm(props.note);

	return (
		<Card className="max-w-md">
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<form.Field name="title">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>{NOTE_MESSAGE.COLUMN_TITLE}</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<FieldError errors={field.state.meta.errors} />
							</div>
						)}
					</form.Field>
					<form.Field name="body">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Label htmlFor={field.name}>{NOTE_MESSAGE.COLUMN_BODY}</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
					</form.Field>
					<div className="flex items-center gap-3">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving…" : "Save changes"}
						</Button>
						<Link to="/notes" className="text-sm hover:underline">
							{APP_MESSAGE.CANCEL}
						</Link>
					</div>
				</form>
				<ConfirmDialog
					open={confirm.open}
					title={NOTE_MESSAGE.UPDATE_CONFIRM_TITLE}
					description={NOTE_MESSAGE.UPDATE_CONFIRM_DESCRIPTION}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
