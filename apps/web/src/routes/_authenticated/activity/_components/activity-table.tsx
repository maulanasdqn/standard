import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatDateTime, NOT_SET, orDash } from "@app/format";
import { ACTIVITY_MESSAGE } from "@app/messages";
import type { TActivity } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { FC, ReactElement } from "react";
import { match, P } from "ts-pattern";
import { EmptyState } from "#/routes/_authenticated/_components/empty-state.tsx";

type TActivityTableProps = {
	entries: readonly TActivity[];
};

const metadataLabel = (metadata: unknown): string =>
	match(metadata)
		.with(P.nullish, () => NOT_SET)
		.otherwise((value) => JSON.stringify(value));

export const ActivityTable: FC<TActivityTableProps> = (props): ReactElement =>
	match(A.isEmpty(props.entries))
		.with(true, () => <EmptyState message={ACTIVITY_MESSAGE.EMPTY} />)
		.otherwise(() => (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{ACTIVITY_MESSAGE.COLUMN_WHEN}</TableHead>
						<TableHead>{ACTIVITY_MESSAGE.COLUMN_ACTOR}</TableHead>
						<TableHead>{ACTIVITY_MESSAGE.COLUMN_ACTION}</TableHead>
						<TableHead>{ACTIVITY_MESSAGE.COLUMN_ENTITY}</TableHead>
						<TableHead>{ACTIVITY_MESSAGE.COLUMN_DETAILS}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{A.map(props.entries, (entry) => (
						<TableRow key={entry.id}>
							<TableCell className="whitespace-nowrap text-neutral-500">
								{formatDateTime(entry.createdAt)}
							</TableCell>
							<TableCell>{orDash(entry.actorEmail)}</TableCell>
							<TableCell>
								<code className="text-xs">{entry.action}</code>
							</TableCell>
							<TableCell>
								<span className="text-neutral-600">{entry.resourceType}</span>{" "}
								<code className="text-xs text-neutral-400">
									{entry.resourceId}
								</code>
							</TableCell>
							<TableCell className="max-w-xs truncate text-xs text-neutral-500">
								{metadataLabel(entry.metadata)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		));
