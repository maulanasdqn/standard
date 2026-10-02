import { Button } from "@app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@app/components/ui/card";
import { Field } from "@app/components/ui/field";
import { Input } from "@app/components/ui/input";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { useProfileForm } from "#/routes/_authenticated/account/_hooks/use-profile-form.ts";

const PROFILE_NAME_ID = "profile-name";

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
							<Field
								id={PROFILE_NAME_ID}
								label={AUTH_MESSAGE.FIELD_NAME}
								errorMap={field.state.meta.errorMap}
								className="flex-1"
							>
								{(control): ReactElement => (
									<Input
										{...control}
										autoComplete="name"
										placeholder={AUTH_MESSAGE.NAME_PLACEHOLDER}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								)}
							</Field>
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
