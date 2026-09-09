import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { useCreateNote } from "#/routes/_authenticated/notes/_hooks/use-notes.ts";

export const CreateNoteForm = (): ReactElement => {
	const createNote = useCreateNote();
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		createNote.mutate(
			{ title, body },
			{
				onSuccess: () => {
					setTitle("");
					setBody("");
				},
			},
		);
	};

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-3 border border-neutral-200 p-4"
		>
			<Input
				placeholder="Title"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				required
			/>
			<Input
				placeholder="Body"
				value={body}
				onChange={(event) => setBody(event.target.value)}
			/>
			<Button
				type="submit"
				disabled={createNote.isPending}
				className="self-start"
			>
				{createNote.isPending ? "Adding…" : "Add note"}
			</Button>
		</form>
	);
};
