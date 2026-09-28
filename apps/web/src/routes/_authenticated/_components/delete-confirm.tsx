import { APP_MESSAGE } from "@app/messages";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@app/components/ui/alert-dialog";
import { Button, buttonVariants } from "@app/components/ui/button";
import { Trash2 } from "lucide-react";
import type { FC, ReactElement } from "react";
import { RowAction } from "#/routes/_authenticated/_components/row-action.tsx";

type TDeleteConfirmProps = {
	title: string;
	description: string;
	disabled?: boolean;
	onConfirm: () => void;
};

export const DeleteConfirm: FC<TDeleteConfirmProps> = (props): ReactElement => {
	const { disabled = false } = props;

	return (
		<AlertDialog>
			<RowAction label={APP_MESSAGE.DELETE}>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						disabled={disabled}
						aria-label={APP_MESSAGE.DELETE}
						className="text-muted-foreground hover:text-destructive"
					>
						<Trash2 />
					</Button>
				</AlertDialogTrigger>
			</RowAction>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{props.title}</AlertDialogTitle>
					<AlertDialogDescription>{props.description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{APP_MESSAGE.CANCEL}</AlertDialogCancel>
					<AlertDialogAction
						className={buttonVariants({ variant: "destructive" })}
						onClick={props.onConfirm}
					>
						{APP_MESSAGE.DELETE}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
