import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@app/components/ui/breadcrumb";
import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { Button } from "@app/components/ui/button";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { FC, ReactElement, ReactNode } from "react";

type TFormPageProps = {
	parentLabel: string;
	parentTo: LinkProps["to"];
	backLabel?: string;
	title: string;
	description: string;
	meta?: ReactNode;
	children: ReactNode;
};

export const FormPage: FC<TFormPageProps> = (props): ReactElement => (
	<Stagger className="flex w-full flex-col gap-6">
		<StaggerItem>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to={props.parentTo}>{props.parentLabel}</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{props.title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</StaggerItem>
		<StaggerItem className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						{props.title}
					</h1>
					<p className="text-sm text-muted-foreground">{props.description}</p>
				</div>
				{props.backLabel !== undefined && (
					<Button variant="ghost" size="sm" className="group/back" asChild>
						<Link to={props.parentTo}>
							<ArrowLeft className="transition-transform group-hover/back:-translate-x-0.5" />
							{props.backLabel}
						</Link>
					</Button>
				)}
			</div>
			{props.meta}
		</StaggerItem>
		<StaggerItem>{props.children}</StaggerItem>
	</Stagger>
);
