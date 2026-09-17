import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { APP_MESSAGE, NOTE_MESSAGE } from "@app/messages";
import type { TNote } from "@app/schemas";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { FC, ReactElement } from "react";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";
import {
	NoteBodyField,
	NoteTitleField,
} from "#/routes/_authenticated/notes/_components/note-fields.tsx";
import { useNoteEditForm } from "#/routes/_authenticated/notes/_hooks/use-note-edit-form.ts";

type TNoteEditFormProps = {
	note: TNote;
};

export const NoteEditForm: FC<TNoteEditFormProps> = (props): ReactElement => {
	const { form, onSubmit, confirm, isPending } = useNoteEditForm(props.note);

	return (
		<form onSubmit={onSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>{NOTE_MESSAGE.DETAILS_TITLE}</CardTitle>
					<CardDescription>{NOTE_MESSAGE.DETAILS_DESCRIPTION}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<form.Field name="title">
						{(field) => (
							<NoteTitleField
								id={field.name}
								value={field.state.value}
								errors={field.state.meta.errors}
								onBlur={field.handleBlur}
								onChange={field.handleChange}
							/>
						)}
					</form.Field>
					<form.Field name="body">
						{(field) => (
							<NoteBodyField
								id={field.name}
								value={field.state.value ?? ""}
								errors={field.state.meta.errors}
								onBlur={field.handleBlur}
								onChange={field.handleChange}
							/>
						)}
					</form.Field>
				</CardContent>
				<CardFooter className="justify-end gap-2 border-t pt-6">
					<Button variant="outline" asChild>
						<Link to="/notes">{APP_MESSAGE.CANCEL}</Link>
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending && <Loader2 className="animate-spin" />}
						{isPending ? NOTE_MESSAGE.SAVING : NOTE_MESSAGE.SAVE_CHANGES}
					</Button>
				</CardFooter>
			</Card>
			<ConfirmDialog
				open={confirm.open}
				title={NOTE_MESSAGE.UPDATE_CONFIRM_TITLE}
				description={NOTE_MESSAGE.UPDATE_CONFIRM_DESCRIPTION}
				onOpenChange={confirm.onOpenChange}
				onConfirm={confirm.onConfirm}
			/>
		</form>
	);
};
