import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { rowOpenProps } from "#/libs/table/row-open.ts";

type TRowProps = {
	open: () => void;
};

const Row = (props: TRowProps): ReactElement => (
	<table>
		<tbody>
			<tr data-testid="row" {...rowOpenProps(props.open)}>
				<td>Ada</td>
				<td>
					<button type="button">Menu</button>
				</td>
			</tr>
		</tbody>
	</table>
);

describe("rowOpenProps", () => {
	it("opens the row when a plain cell is clicked", (): void => {
		const open = vi.fn();
		render(<Row open={open} />);

		fireEvent.click(screen.getByText("Ada"));

		expect(open).toHaveBeenCalledOnce();
	});

	it("leaves a click on a control inside the row alone", (): void => {
		const open = vi.fn();
		render(<Row open={open} />);

		fireEvent.click(screen.getByRole("button", { name: "Menu" }));

		expect(open).not.toHaveBeenCalled();
	});

	it("opens the row from the keyboard with Enter", (): void => {
		const open = vi.fn();
		render(<Row open={open} />);

		fireEvent.keyDown(screen.getByTestId("row"), { key: "Enter" });

		expect(open).toHaveBeenCalledOnce();
	});

	it("adds nothing when the row cannot be opened", (): void => {
		expect(rowOpenProps(undefined)).toEqual({});
	});
});
