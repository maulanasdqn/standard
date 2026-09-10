import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@app/components/ui/table";
import { formatDateTime, orDash } from "@app/format";
import type { TActivity } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import type { ReactElement } from "react";
import { match, P } from "ts-pattern";

type TActivityTableProps = {
	entries: readonly TActivity[];
};

const metadataLabel = (metadata: unknown): string =>
	match(metadata)
		.with(P.nullish, () => "—")
		.otherwise((value) => JSON.stringify(value));

export const ActivityTable = ({ entries }: TActivityTableProps): ReactElement =>
	match(A.isEmpty(entries))
		.with(true, () => (
			<p className="text-sm text-neutral-500">No activity yet.</p>
		))
		.otherwise(() => (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>When</TableHead>
						<TableHead>Actor</TableHead>
						<TableHead>Action</TableHead>
						<TableHead>Entity</TableHead>
						<TableHead>Details</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{A.map(entries, (entry) => (
						<TableRow key={entry.id}>
							<TableCell className="whitespace-nowrap text-neutral-500">
								{formatDateTime(entry.createdAt)}
							</TableCell>
							<TableCell>{orDash(entry.actorEmail)}</TableCell>
							<TableCell>
								<code className="text-xs">{entry.action}</code>
							</TableCell>
							<TableCell>
								<span className="text-neutral-600">{entry.entityType}</span>{" "}
								<code className="text-xs text-neutral-400">
									{entry.entityId}
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
