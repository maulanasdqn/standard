import { A } from "@mobily/ts-belt";
import type { FC, ReactElement, ReactNode } from "react";
import { cn } from "../lib/utils.ts";
import {
	FieldError,
	fieldErrorMessage,
	type TFieldErrorSource,
} from "./field-error.tsx";
import { InfoTooltip } from "./info-tooltip.tsx";
import { Label } from "./label.tsx";

const DESCRIPTION_SUFFIX = "-description";
const ERROR_SUFFIX = "-error";
const ID_SEPARATOR = " ";

export type TFieldControlProps = {
	id: string;
	"aria-describedby"?: string;
	"aria-invalid": boolean;
};

type TFieldProps = TFieldErrorSource & {
	id: string;
	label: ReactNode;
	info?: ReactNode;
	description?: ReactNode;
	labelAside?: ReactNode;
	className?: string;
	labelClassName?: string;
	children: (control: TFieldControlProps) => ReactNode;
};

export const fieldDescriptionId = (id: string): string =>
	`${id}${DESCRIPTION_SUFFIX}`;

export const fieldErrorId = (id: string): string => `${id}${ERROR_SUFFIX}`;

const describedBy = (
	ids: readonly (string | undefined)[],
): string | undefined => {
	const present = A.filter(ids, (id): id is string => id !== undefined);
	return A.isEmpty(present) ? undefined : A.join(present, ID_SEPARATOR);
};

export const fieldControlProps = (
	id: string,
	hasDescription: boolean,
	invalid: boolean,
): TFieldControlProps => ({
	id,
	"aria-describedby": describedBy([
		hasDescription ? fieldDescriptionId(id) : undefined,
		invalid ? fieldErrorId(id) : undefined,
	]),
	"aria-invalid": invalid,
});

export const Field: FC<TFieldProps> = (props): ReactElement => {
	const hasDescription =
		props.description !== undefined && props.description !== "";
	const invalid = fieldErrorMessage(props) !== undefined;

	return (
		<div className={cn("flex flex-col gap-2", props.className)}>
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5">
					<Label htmlFor={props.id} className={props.labelClassName}>
						{props.label}
					</Label>
					{props.info !== undefined && <InfoTooltip content={props.info} />}
				</div>
				{props.labelAside}
			</div>
			{props.children(fieldControlProps(props.id, hasDescription, invalid))}
			{hasDescription && (
				<p
					id={fieldDescriptionId(props.id)}
					className="text-xs text-muted-foreground"
				>
					{props.description}
				</p>
			)}
			<FieldError
				id={fieldErrorId(props.id)}
				errors={props.errors}
				errorMap={props.errorMap}
			/>
		</div>
	);
};
