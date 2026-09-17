import { Input } from "@app/components/ui/input";
import { NOTE_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { useNoteSearchForm } from "#/routes/_authenticated/notes/_hooks/use-note-search-form.ts";

export const NoteSearch: FC = (): ReactElement => {
	const { form, onSubmit } = useNoteSearchForm();

	return (
		<form onSubmit={onSubmit} className="max-w-sm">
			<form.Field name="search">
				{(field) => (
					<Input
						type="search"
						placeholder={NOTE_MESSAGE.SEARCH_PLACEHOLDER}
						aria-label={NOTE_MESSAGE.SEARCH_PLACEHOLDER}
						value={field.state.value ?? ""}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.Field>
		</form>
	);
};
