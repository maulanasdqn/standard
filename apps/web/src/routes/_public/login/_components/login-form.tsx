import { Button } from "@app/components/ui/button";
import { FieldError, hasFieldError } from "@app/components/ui/field-error";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";
import { useLoginForm } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm = (): ReactElement => {
	const { form, serverError, onSubmit } = useLoginForm();

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Login to your account</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<div className="grid gap-6">
				<form.Field name="email">
					{(field) => (
						<div className="grid gap-1.5">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								type="email"
								placeholder="m@example.com"
								aria-invalid={hasFieldError(field.state.meta.errorMap)}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldError errorMap={field.state.meta.errorMap} />
						</div>
					)}
				</form.Field>
				<form.Field name="password">
					{(field) => (
						<div className="grid gap-1.5">
							<div className="flex items-center">
								<Label htmlFor={field.name}>Password</Label>
								<a
									href="/"
									className="ml-auto text-sm underline-offset-4 hover:underline"
								>
									Forgot your password?
								</a>
							</div>
							<Input
								id={field.name}
								type="password"
								aria-invalid={hasFieldError(field.state.meta.errorMap)}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldError errorMap={field.state.meta.errorMap} />
						</div>
					)}
				</form.Field>
				<FieldError errors={serverError ? [{ message: serverError }] : []} />
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="animate-spin" />}
							{isSubmitting ? "Signing in…" : "Login"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
};
