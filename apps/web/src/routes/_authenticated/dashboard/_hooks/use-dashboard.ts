import { HEALTH_STATUS } from "@app/schemas";
import { APP_VERSION } from "@app/version";
import { useQuery } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";
import type { TClientErrors, TClientOutputs } from "#/libs/orpc/types.ts";
import {
	HEALTH_VIEW_STATUS,
	type THealthViewStatus,
} from "#/routes/health/_constants/status.ts";

type TUserOut = TClientOutputs["user"];
type TUserErr = TClientErrors["user"];
type TNoteOut = TClientOutputs["note"];
type TNoteErr = TClientErrors["note"];
type TRoleOut = TClientOutputs["role"];
type TRoleErr = TClientErrors["role"];
type TActivityOut = TClientOutputs["activity"];
type TActivityErr = TClientErrors["activity"];

export type TDashboardHealth = {
	status: THealthViewStatus;
	webVersion: string;
	apiVersion: string | null;
};

export const useDashboardUsers = (): { total: number } => {
	const { data } = useSuspenseQuery<TUserOut["list"], TUserErr["list"]>(
		orpc.user.list.queryOptions({
			input: { page: 1, pageSize: 1 },
			queryKey: orpc.user.list.queryKey({
				input: { page: 1, pageSize: 1 },
			}),
		}),
	);
	return { total: data.total };
};

export const useDashboardRoles = (): { total: number } => {
	const { data } = useSuspenseQuery<TRoleOut["list"], TRoleErr["list"]>(
		orpc.role.list.queryOptions({
			queryKey: orpc.role.list.queryKey(),
		}),
	);
	return { total: data.items.length };
};

export const useDashboardNotes = (): { total: number } => {
	const { data } = useSuspenseQuery<TNoteOut["list"], TNoteErr["list"]>(
		orpc.note.list.queryOptions({
			input: { page: 1, pageSize: 1 },
			queryKey: orpc.note.list.queryKey({
				input: { page: 1, pageSize: 1 },
			}),
		}),
	);
	return { total: data.total };
};

export const useDashboardActivity = (): TActivityOut["list"] => {
	const { data } = useSuspenseQuery<TActivityOut["list"], TActivityErr["list"]>(
		orpc.activity.list.queryOptions({
			input: { page: 1, pageSize: 5 },
			queryKey: orpc.activity.list.queryKey({
				input: { page: 1, pageSize: 5 },
			}),
		}),
	);
	return data;
};

export const useDashboardHealth = (): TDashboardHealth => {
	const query = useQuery(
		orpc.health.check.queryOptions({ queryKey: orpc.health.check.key() }),
	);

	const status = match(query)
		.with(
			{ isPending: true },
			(): THealthViewStatus => HEALTH_VIEW_STATUS.CHECKING,
		)
		.with(
			{ data: { status: HEALTH_STATUS.OK } },
			(): THealthViewStatus => HEALTH_VIEW_STATUS.OK,
		)
		.otherwise((): THealthViewStatus => HEALTH_VIEW_STATUS.DEGRADED);

	return {
		status,
		webVersion: APP_VERSION,
		apiVersion: query.data?.version ?? null,
	};
};
