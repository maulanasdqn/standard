import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { NoteTable } from "#/routes/_authenticated/notes/_components/note-table.tsx";

const renderWithClient = (ui: ReactElement): RenderResult => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("NoteTable", () => {
	it("renders an empty state when there are no notes", (): void => {
		renderWithClient(<NoteTable notes={[]} />);
		expect(screen.getByText("No notes yet.")).toBeInTheDocument();
	});
});
