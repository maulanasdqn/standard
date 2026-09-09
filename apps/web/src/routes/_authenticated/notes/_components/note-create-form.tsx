import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import type { ReactElement } from "react";
import { useNoteCreateForm } from "#/routes/_authenticated/notes/_hooks/use-note-create-form.ts";

export const NoteCreateForm = (): ReactElement => {
	const { form, onSubmit } = useNoteCreateForm();

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-3 border border-neutral-200 p-4"
		>
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
					<Button type="submit" disabled={isSubmitting} className="self-start">
						{isSubmitting ? "Adding…" : "Add note"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
};
