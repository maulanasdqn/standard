import type { ReactElement } from "react";
import { match } from "ts-pattern";
import type { THealthState } from "#/routes/health/_hooks/use-health.ts";

const statusLabel = (status: THealthState["status"]): string =>
	match(status)
		.with("checking", () => "Checking…")
		.with("ok", () => "Ok")
		.with("degraded", () => "Degraded")
		.exhaustive();

const statusClassName = (status: THealthState["status"]): string =>
	match(status)
		.with("checking", () => "text-neutral-500")
		.with("ok", () => "text-emerald-600")
		.with("degraded", () => "text-red-600")
		.exhaustive();

export const HealthPanel = ({
	status,
	webVersion,
	apiVersion,
}: THealthState): ReactElement => (
	<dl className="grid grid-cols-[8rem_1fr] gap-2 text-sm">
		<dt className="text-neutral-500">Status</dt>
		<dd className={statusClassName(status)}>{statusLabel(status)}</dd>
		<dt className="text-neutral-500">Web version</dt>
		<dd>{webVersion}</dd>
		<dt className="text-neutral-500">API version</dt>
		<dd>{apiVersion ?? "—"}</dd>
	</dl>
);
