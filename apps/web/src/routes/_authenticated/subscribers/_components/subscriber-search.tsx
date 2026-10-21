import { Input } from "@app/components/ui/input";
import { NEWSLETTER_MESSAGE } from "@app/messages";
import type { FC, ReactElement } from "react";
import { useSubscriberSearchForm } from "#/routes/_authenticated/subscribers/_hooks/use-subscriber-search-form.ts";

export const SubscriberSearch: FC = (): ReactElement => {
	const { form, onSubmit } = useSubscriberSearchForm();

	return (
		<form onSubmit={onSubmit} className="max-w-sm">
			<form.Field name="search">
				{(field) => (
					<Input
						type="search"
						placeholder={NEWSLETTER_MESSAGE.SEARCH_PLACEHOLDER}
						aria-label={NEWSLETTER_MESSAGE.SEARCH_PLACEHOLDER}
						value={field.state.value ?? ""}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.Field>
		</form>
	);
};
