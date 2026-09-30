import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@app/components/ui/alert-dialog";
import { buttonVariants } from "@app/components/ui/button";
import { APP_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";

type TConfirmDialogProps = {
	open: boolean;
	title: string;
	description: string;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	confirmLabel?: string;
	destructive?: boolean;
};

export const ConfirmDialog: FC<TConfirmDialogProps> = (props): ReactElement => {
	const { confirmLabel = APP_MESSAGE.CONFIRM, destructive = false } = props;

	return (
		<AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{props.title}</AlertDialogTitle>
					<AlertDialogDescription>{props.description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{APP_MESSAGE.CANCEL}</AlertDialogCancel>
					<AlertDialogAction
						className={
							destructive
								? buttonVariants({ variant: "destructive" })
								: undefined
						}
						onClick={props.onConfirm}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
