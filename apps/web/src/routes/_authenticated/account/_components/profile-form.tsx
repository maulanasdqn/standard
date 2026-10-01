import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { useProfileForm } from "#/routes/_authenticated/account/_hooks/use-profile-form.ts";

export const ProfileForm: FC = (): ReactElement => {
	const { form, onSubmit } = useProfileForm();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{AUTH_MESSAGE.PROFILE_TITLE}</CardTitle>
				<CardDescription>{AUTH_MESSAGE.PROFILE_DESCRIPTION}</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={onSubmit}
					className="flex flex-col gap-4 sm:flex-row sm:items-end"
				>
					<form.Field name="name">
						{(field) => (
							<div className="flex flex-1 flex-col gap-1">
								<Label htmlFor="profile-name">{AUTH_MESSAGE.FIELD_NAME}</Label>
								<Input
									id="profile-name"
									autoComplete="name"
									placeholder={AUTH_MESSAGE.NAME_PLACEHOLDER}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<FieldError errorMap={field.state.meta.errorMap} />
							</div>
						)}
					</form.Field>
					<form.Subscribe
						selector={(state) => [state.isSubmitting, state.isDirty] as const}
					>
						{([isSubmitting, isDirty]) => (
							<Button type="submit" disabled={isSubmitting || !isDirty}>
								{isSubmitting
									? AUTH_MESSAGE.PROFILE_SAVING
									: AUTH_MESSAGE.PROFILE_SAVE}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
};
