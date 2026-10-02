import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { UI_MESSAGE } from "../../lib/messages.ts";
import {
	Field,
	fieldControlProps,
	fieldDescriptionId,
	fieldErrorId,
} from "../field.tsx";
import { Input } from "../input.tsx";

const FIELD_ID = "profile-name";
const LABEL = "Name";
const DESCRIPTION = "Shown to other members";
const INFO = "Your full name";
const ERROR = "Name is required";

const ATTRIBUTE = {
	DESCRIBED_BY: "aria-describedby",
	INVALID: "aria-invalid",
} as const;

const renderField = (
	extra: Partial<{
		description: string;
		info: string;
		errors: readonly unknown[];
	}>,
): void => {
	render(
		<Field
			id={FIELD_ID}
			label={LABEL}
			description={extra.description}
			info={extra.info}
			errors={extra.errors}
		>
			{(control): ReactElement => <Input {...control} />}
		</Field>,
	);
};

describe("Field", () => {
	afterEach(cleanup);

	it("associates the label with the control", (): void => {
		renderField({});

		expect(screen.getByLabelText(LABEL).id).toBe(FIELD_ID);
		expect(screen.getByLabelText(LABEL).getAttribute(ATTRIBUTE.INVALID)).toBe(
			String(false),
		);
	});

	it("describes the control with its description", (): void => {
		renderField({ description: DESCRIPTION });

		expect(screen.getByText(DESCRIPTION).id).toBe(fieldDescriptionId(FIELD_ID));
		expect(
			screen.getByLabelText(LABEL).getAttribute(ATTRIBUTE.DESCRIBED_BY),
		).toBe(fieldDescriptionId(FIELD_ID));
	});

	it("marks the control invalid and points it at the error", (): void => {
		renderField({ description: DESCRIPTION, errors: [{ message: ERROR }] });

		const control = screen.getByLabelText(LABEL);
		expect(control.getAttribute(ATTRIBUTE.INVALID)).toBe(String(true));
		expect(control.getAttribute(ATTRIBUTE.DESCRIBED_BY)).toBe(
			`${fieldDescriptionId(FIELD_ID)} ${fieldErrorId(FIELD_ID)}`,
		);
		expect(screen.getByRole("alert").id).toBe(fieldErrorId(FIELD_ID));
		expect(screen.getByRole("alert").textContent).toBe(ERROR);
	});

	it("shows an info button beside the label only when info is given", (): void => {
		renderField({});
		expect(
			screen.queryByRole("button", { name: UI_MESSAGE.MORE_INFO }),
		).toBeNull();

		cleanup();
		renderField({ info: INFO });
		expect(
			screen.getByRole("button", { name: UI_MESSAGE.MORE_INFO }),
		).toBeTruthy();
	});
});

describe("fieldControlProps", () => {
	it("leaves aria-describedby out when there is nothing to describe", (): void => {
		expect(fieldControlProps(FIELD_ID, false, false)).toEqual({
			id: FIELD_ID,
			[ATTRIBUTE.DESCRIBED_BY]: undefined,
			[ATTRIBUTE.INVALID]: false,
		});
	});
});
