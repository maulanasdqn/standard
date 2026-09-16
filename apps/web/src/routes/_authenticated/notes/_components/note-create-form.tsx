import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import type { FC, ReactElement } from "react";
import { useNoteCreateForm } from "#/routes/_authenticated/notes/_hooks/use-note-create-form.ts";
import { Card, CardContent } from "@app/components/ui/card";
import { NOTE_MESSAGE } from "@app/messages";
import { ConfirmDialog } from "#/routes/_authenticated/_components/confirm-dialog.tsx";

export const NoteCreateForm: FC = (): ReactElement => {
	const { form, onSubmit, confirm } = useNoteCreateForm();

	return (
		<Card>
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-3">
					<form.Field name="title">
						{(field) => (
							<div className="flex flex-col gap-1">
								<Input
									id={field.name}
									placeholder="Title"
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
							<Input
								id={field.name}
								placeholder="Body"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						)}
					</form.Field>
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button
								type="submit"
								disabled={isSubmitting}
								className="self-start"
							>
								{isSubmitting ? "Adding…" : "Add note"}
							</Button>
						)}
					</form.Subscribe>
				</form>
				<ConfirmDialog
					open={confirm.open}
					title={NOTE_MESSAGE.CREATE_CONFIRM_TITLE}
					description={NOTE_MESSAGE.CREATE_CONFIRM_DESCRIPTION}
					onOpenChange={confirm.onOpenChange}
					onConfirm={confirm.onConfirm}
				/>
			</CardContent>
		</Card>
	);
};
