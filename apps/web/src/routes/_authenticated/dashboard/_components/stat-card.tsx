import { CountUp } from "@app/components/motion/count-up";
import { HoverLift } from "@app/components/motion/hover-lift";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { FC, ReactElement } from "react";

type TStatCardProps = {
	title: string;
	value: number;
	icon: LucideIcon;
	to: LinkProps["to"];
};

export const StatCard: FC<TStatCardProps> = (props): ReactElement => (
	<HoverLift>
		<Link to={props.to} className="group">
			<Card className="transition-[border-color,box-shadow] group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						{props.title}
					</CardTitle>
					<props.icon className="size-4 text-muted-foreground transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 group-hover:text-primary" />
				</CardHeader>
				<CardContent>
					<CountUp
						value={props.value}
						className="block text-3xl font-bold tracking-tight tabular-nums"
					/>
				</CardContent>
			</Card>
		</Link>
	</HoverLift>
);
