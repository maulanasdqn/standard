import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { NoteList } from "#/routes/_authenticated/notes/_components/note-list.tsx";

const renderWithClient = (ui: React.ReactElement) => {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

describe("NoteList", () => {
	it("renders an empty state when there are no notes", () => {
		renderWithClient(<NoteList notes={[]} />);
		expect(screen.getByText("No notes yet.")).toBeInTheDocument();
	});
});
