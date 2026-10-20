import { match } from "ts-pattern";

export const BUTTON_VARIANT = {
	PRIMARY: "primary",
	SECONDARY: "secondary",
} as const;

export type TButtonVariant =
	(typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

const BUTTON_BASE =
	"inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variantClassOf = (variant: TButtonVariant): string =>
	match(variant)
		.with(
			BUTTON_VARIANT.PRIMARY,
			(): string => "bg-primary text-primary-foreground hover:bg-primary/90",
		)
		.with(
			BUTTON_VARIANT.SECONDARY,
			(): string =>
				"border border-border bg-background hover:bg-accent hover:text-accent-foreground",
		)
		.exhaustive();

export const buttonClassOf = (variant: TButtonVariant): string =>
	`${BUTTON_BASE} ${variantClassOf(variant)}`;
