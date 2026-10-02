import { cn } from "@app/components/lib/utils";
import type { FC, ReactElement } from "react";
import { BRAND_MARK } from "#/routes/_constants/brand.ts";

type TBrandMarkProps = {
	className?: string;
};

export const BrandMark: FC<TBrandMarkProps> = (props): ReactElement => (
	<svg
		viewBox={BRAND_MARK.VIEW_BOX}
		aria-hidden
		focusable={false}
		className={cn("aspect-square shrink-0 text-primary", props.className)}
	>
		<rect
			width={BRAND_MARK.SIZE}
			height={BRAND_MARK.SIZE}
			rx={BRAND_MARK.RADIUS}
			fill="currentColor"
		/>
		<path d={BRAND_MARK.LETTER_PATH} className="fill-primary-foreground" />
	</svg>
);
