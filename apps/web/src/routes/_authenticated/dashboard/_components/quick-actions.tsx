import { Guard } from "@app/components/guard/guard";
import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { DASHBOARD_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { FC, ReactElement } from "react";
import { DASHBOARD_ACTIONS } from "#/routes/_authenticated/dashboard/_constants/widgets.ts";

export const QuickActions: FC = (): ReactElement => (
	<Card>
		<CardHeader className="pb-2">
			<CardTitle className="text-sm font-medium text-muted-foreground">
				{DASHBOARD_MESSAGE.QUICK_ACTIONS}
			</CardTitle>
		</CardHeader>
		<CardContent className="flex flex-col gap-2">
			{A.map(DASHBOARD_ACTIONS, (action) => (
				<Guard key={action.label} permissions={action.permissions}>
					<Button variant="outline" size="sm" className="justify-start" asChild>
						<Link to={action.to}>
							<Plus className="size-4" />
							{action.label}
						</Link>
					</Button>
				</Guard>
			))}
		</CardContent>
	</Card>
);
