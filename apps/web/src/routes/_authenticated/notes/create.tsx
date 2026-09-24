import { checkRoutePermissions } from "#/libs/auth/route-guard.ts";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteCreateForm } from "#/routes/_authenticated/notes/_components/note-create-form.tsx";
import { FormPage } from "#/routes/_authenticated/_components/form-page.tsx";

const NoteCreatePage: FC = (): ReactElement => (
	<FormPage
		parentLabel={NOTE_MESSAGE.TITLE}
		parentTo="/notes"
		backLabel={NOTE_MESSAGE.BACK_TO_NOTES}
		title={NOTE_MESSAGE.NEW_NOTE}
		description={NOTE_MESSAGE.CREATE_DESCRIPTION}
	>
		<NoteCreateForm />
	</FormPage>
);

export const Route = createFileRoute("/_authenticated/notes/create")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_WRITE] }),
	component: NoteCreatePage,
});
