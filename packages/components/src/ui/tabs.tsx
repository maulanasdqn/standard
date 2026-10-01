import type * as React from "react";
import type { FC, ReactElement } from "react";
import { cn } from "../lib/utils.ts";
import { Tabs as TabsPrimitive } from "radix-ui";

export const Tabs: FC<React.ComponentProps<typeof TabsPrimitive.Root>> = (
	props,
): ReactElement => {
	const { className, ...rest } = props;

	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-6", className)}
			{...rest}
		/>
	);
};

export const TabsList: FC<React.ComponentProps<typeof TabsPrimitive.List>> = (
	props,
): ReactElement => {
	const { className, ...rest } = props;

	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
				className,
			)}
			{...rest}
		/>
	);
};

export const TabsTrigger: FC<
	React.ComponentProps<typeof TabsPrimitive.Trigger>
> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...rest}
		/>
	);
};

export const TabsContent: FC<
	React.ComponentProps<typeof TabsPrimitive.Content>
> = (props): ReactElement => {
	const { className, ...rest } = props;

	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("outline-none", className)}
			{...rest}
		/>
	);
};
