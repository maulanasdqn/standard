import { Button } from "@app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { APP_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { MoreHorizontal } from "lucide-react";
import { type FC, Fragment, type ReactElement } from "react";
import { match } from "ts-pattern";
import type { TRowAction } from "#/routes/_authenticated/_constants/row-action.ts";
import { useVisibleRowActions } from "#/routes/_authenticated/_hooks/use-visible-row-actions.ts";

type TRowActionsMenuProps = {
	actions: readonly TRowAction[];
};

export const RowActionsMenu: FC<TRowActionsMenuProps> = (
	props,
): ReactElement => {
	const visible = useVisibleRowActions(props.actions);

	return match(A.isEmpty(visible))
		.with(true, () => <Fragment />)
		.otherwise(() => (
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={APP_MESSAGE.ROW_ACTIONS}
						className="data-[state=open]:bg-accent"
					>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					{A.mapWithIndex(visible, (index, action) => (
						<Fragment key={action.id}>
							{action.destructive && index > 0 && <DropdownMenuSeparator />}
							<DropdownMenuItem
								variant={action.destructive ? "destructive" : "default"}
								disabled={action.disabled}
								onSelect={action.onSelect}
							>
								<action.icon />
								{action.label}
							</DropdownMenuItem>
						</Fragment>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		));
};
