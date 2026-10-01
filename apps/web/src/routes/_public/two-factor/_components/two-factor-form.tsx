import { Stagger, StaggerItem } from "@app/components/motion/stagger";
import { Button } from "@app/components/ui/button";
import { Checkbox } from "@app/components/ui/checkbox";
import { FieldError } from "@app/components/ui/field-error";
import { Label } from "@app/components/ui/label";
import { AUTH_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { AuthField } from "#/routes/_components/auth-field.tsx";
import { AuthFooterLink } from "#/routes/_components/auth-footer-link.tsx";
import { AuthHeading } from "#/routes/_components/auth-heading.tsx";
import { AuthSubmit } from "#/routes/_components/auth-submit.tsx";
import { useTwoFactorChallenge } from "#/routes/_public/two-factor/_hooks/use-two-factor-challenge.ts";

const TRUST_DEVICE_ID = "two-factor-trust-device";

export const TwoFactorForm: FC = (): ReactElement => {
	const challenge = useTwoFactorChallenge();
	const { form } = challenge;

	return (
		<form onSubmit={challenge.onSubmit} noValidate>
			<Stagger className="flex flex-col gap-6">
				<StaggerItem>
					<AuthHeading
						title={AUTH_MESSAGE.TWO_FACTOR_CHALLENGE_TITLE}
						description={
							challenge.useBackupCode
								? AUTH_MESSAGE.TWO_FACTOR_BACKUP_CHALLENGE_DESCRIPTION
								: AUTH_MESSAGE.TWO_FACTOR_CHALLENGE_DESCRIPTION
						}
					/>
				</StaggerItem>
				<div className="grid gap-5">
					<StaggerItem>
						<form.Field name="code">
							{(field) => (
								<AuthField
									id={field.name}
									label={
										challenge.useBackupCode
											? AUTH_MESSAGE.FIELD_BACKUP_CODE
											: AUTH_MESSAGE.FIELD_TWO_FACTOR_CODE
									}
									type="text"
									autoComplete="one-time-code"
									placeholder={
										challenge.useBackupCode
											? AUTH_MESSAGE.BACKUP_CODE_PLACEHOLDER
											: AUTH_MESSAGE.TWO_FACTOR_CODE_PLACEHOLDER
									}
									value={field.state.value}
									errorMap={field.state.meta.errorMap}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
								/>
							)}
						</form.Field>
					</StaggerItem>
					<StaggerItem>
						<form.Field name="trustDevice">
							{(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										id={TRUST_DEVICE_ID}
										checked={field.state.value}
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<Label htmlFor={TRUST_DEVICE_ID} className="font-normal">
										{AUTH_MESSAGE.TWO_FACTOR_TRUST_DEVICE}
									</Label>
								</div>
							)}
						</form.Field>
					</StaggerItem>
					<FieldError
						errors={
							challenge.serverError ? [{ message: challenge.serverError }] : []
						}
					/>
					<StaggerItem>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<AuthSubmit
									pending={isSubmitting}
									label={AUTH_MESSAGE.TWO_FACTOR_VERIFY}
									pendingLabel={AUTH_MESSAGE.TWO_FACTOR_VERIFYING}
								/>
							)}
						</form.Subscribe>
					</StaggerItem>
					<StaggerItem className="flex flex-col items-center gap-3">
						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={challenge.toggleMethod}
						>
							{challenge.useBackupCode
								? AUTH_MESSAGE.TWO_FACTOR_USE_APP
								: AUTH_MESSAGE.TWO_FACTOR_USE_BACKUP}
						</Button>
						<AuthFooterLink label={AUTH_MESSAGE.BACK_TO_SIGN_IN} to="/login" />
					</StaggerItem>
				</div>
			</Stagger>
		</form>
	);
};
