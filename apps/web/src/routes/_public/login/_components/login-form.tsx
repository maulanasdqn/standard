import { Button } from "@app/components/ui/button";
import { FieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import type { ReactElement } from "react";
import { useLoginForm } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm = (): ReactElement => {
	const { form, serverError, onSubmit } = useLoginForm();

	return (
		<form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<form.Field name="email">
				{(field) => (
					<div className="flex flex-col gap-1">
						<label htmlFor={field.name} className="text-sm font-medium">
							Email
						</label>
						<Input
							id={field.name}
							type="email"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<form.Field name="password">
				{(field) => (
					<div className="flex flex-col gap-1">
						<label htmlFor={field.name} className="text-sm font-medium">
							Password
						</label>
						<Input
							id={field.name}
							type="password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<FieldError errors={serverError ? [{ message: serverError }] : []} />
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Signing in…" : "Sign in"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
};
