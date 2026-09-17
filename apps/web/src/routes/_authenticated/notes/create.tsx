import { checkRoutePermissions } from "@app/components/guard/route-guard";
import { NOTE_MESSAGE } from "@app/messages";
import { PERMISSION } from "@app/permissions";
import { createFileRoute } from "@tanstack/react-router";
import type { FC, ReactElement } from "react";
import { NoteCreateForm } from "#/routes/_authenticated/notes/_components/note-create-form.tsx";

const NoteCreatePage: FC = (): ReactElement => (
	<div className="flex flex-col gap-6">
		<h1 className="text-xl font-semibold">{NOTE_MESSAGE.NEW_NOTE}</h1>
		<NoteCreateForm />
	</div>
);

export const Route = createFileRoute("/_authenticated/notes/create")({
	beforeLoad: checkRoutePermissions({ permissions: [PERMISSION.NOTE_WRITE] }),
	component: NoteCreatePage,
});
