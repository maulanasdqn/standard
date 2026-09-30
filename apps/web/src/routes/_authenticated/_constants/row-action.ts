import type { TPermission } from "@app/permissions";
import type { LucideIcon } from "lucide-react";

export const ROW_ACTION = {
	VIEW: "view",
	EDIT: "edit",
	DELETE: "delete",
} as const;

export type TRowActionId = (typeof ROW_ACTION)[keyof typeof ROW_ACTION];

export type TRowAction = {
	id: TRowActionId;
	label: string;
	icon: LucideIcon;
	permissions: readonly TPermission[];
	available?: boolean;
	disabled?: boolean;
	destructive?: boolean;
	onSelect: () => void;
};
