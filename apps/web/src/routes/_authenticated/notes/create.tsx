import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteCreateForm } from "#/routes/_authenticated/notes/_components/note-create-form.tsx";
import { NoteFormPage } from "#/routes/_authenticated/notes/_components/note-form-page.tsx";

const NoteCreatePage: FC = (): ReactElement => (
	<NoteFormPage
		title={NOTE_MESSAGE.NEW_NOTE}
		description={NOTE_MESSAGE.CREATE_DESCRIPTION}
	>
		<NoteCreateForm />
	</NoteFormPage>
);

export const Route = createFileRoute("/_authenticated/notes/create")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_WRITE] }),
	component: NoteCreatePage,
});
