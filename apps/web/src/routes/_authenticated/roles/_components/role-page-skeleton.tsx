import { FormSkeleton } from "@app/components/skeleton/form-skeleton";
import type { FC, ReactElement } from "react";
import { FormPageSkeleton } from "#/routes/_components/form-page-skeleton.tsx";

export const RolePageSkeleton: FC = (): ReactElement => (
	<FormPageSkeleton>
		<FormSkeleton fields={1} textArea />
	</FormPageSkeleton>
);
