import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { HealthPanel } from "#/routes/health/_components/health-panel.tsx";
import { useHealth } from "#/routes/health/_hooks/use-health.ts";

export const Route = createFileRoute("/health/")({
	component: HealthPage,
});

function HealthPage(): ReactElement {
	const health = useHealth();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6">
			<h1 className="text-xl font-semibold">Health</h1>
			<HealthPanel {...health} />
		</div>
	);
}
