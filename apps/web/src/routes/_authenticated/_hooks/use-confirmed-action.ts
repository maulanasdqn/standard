import { useState } from "react";
import { match, P } from "ts-pattern";

export type TConfirmedAction<TValue> = {
	open: boolean;
	request: (value: TValue) => void;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

export const useConfirmedAction = <TValue>(
	run: (value: TValue) => void,
): TConfirmedAction<TValue> => {
	const [pending, setPending] = useState<TValue | null>(null);

	return {
		open: pending !== null,
		request: (value: TValue): void => setPending(value),
		onOpenChange: (open: boolean): void =>
			match(open)
				.with(false, () => setPending(null))
				.otherwise(() => undefined),
		onConfirm: (): void => {
			match(pending)
				.with(P.nullish, () => undefined)
				.otherwise((value) => run(value));
			setPending(null);
		},
	};
};
