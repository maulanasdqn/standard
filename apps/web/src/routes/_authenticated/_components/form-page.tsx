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
import { PageTitle } from "#/routes/_authenticated/_components/page-title.tsx";

type TFormPageProps = {
	parentLabel: string;
	parentTo: LinkProps["to"];
	backLabel?: string;
	title: string;
	description?: string;
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
				<PageTitle info={props.description} className="text-2xl tracking-tight">
					{props.title}
				</PageTitle>
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
