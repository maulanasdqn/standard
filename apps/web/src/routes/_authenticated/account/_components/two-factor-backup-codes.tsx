import { Button } from "@app/components/ui/button";
import { AUTH_MESSAGE } from "@app/messages";
import { A } from "@mobily/ts-belt";
import { Copy } from "lucide-react";
import type { FC, ReactElement } from "react";
import { toast } from "sonner";

const CODE_SEPARATOR = "\n";

type TTwoFactorBackupCodesProps = {
	codes: readonly string[];
	onDone: () => void;
};

const copyCodes = (codes: readonly string[]): void =>
	void navigator.clipboard
		.writeText(A.join(codes, CODE_SEPARATOR))
		.then(() => toast.success(AUTH_MESSAGE.TWO_FACTOR_CODES_COPIED));

export const TwoFactorBackupCodes: FC<TTwoFactorBackupCodesProps> = (
	props,
): ReactElement => (
	<div className="flex flex-col gap-4">
		<div className="flex flex-col gap-1">
			<p className="text-sm font-medium">
				{AUTH_MESSAGE.TWO_FACTOR_BACKUP_TITLE}
			</p>
			<p className="text-sm text-muted-foreground">
				{AUTH_MESSAGE.TWO_FACTOR_BACKUP_DESCRIPTION}
			</p>
		</div>
		<ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm sm:grid-cols-5">
			{A.map(props.codes, (code) => (
				<li key={code}>{code}</li>
			))}
		</ul>
		<div className="flex gap-2">
			<Button
				type="button"
				variant="outline"
				onClick={() => copyCodes(props.codes)}
			>
				<Copy />
				{AUTH_MESSAGE.TWO_FACTOR_COPY_CODES}
			</Button>
			<Button type="button" onClick={props.onDone}>
				{AUTH_MESSAGE.TWO_FACTOR_DONE}
			</Button>
		</div>
	</div>
);
