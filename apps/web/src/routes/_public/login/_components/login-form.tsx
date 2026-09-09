import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { useLogin } from "#/routes/_public/login/_hooks/use-login.ts";

export const LoginForm = (): ReactElement => {
	const { login, error, isSubmitting } = useLogin();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void login(email, password);
	};

	return (
		<form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<div className="flex flex-col gap-1">
				<label htmlFor="email" className="text-sm font-medium">
					Email
				</label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
			</div>
			<div className="flex flex-col gap-1">
				<label htmlFor="password" className="text-sm font-medium">
					Password
				</label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
				/>
			</div>
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Signing in…" : "Sign in"}
			</Button>
		</form>
	);
};
