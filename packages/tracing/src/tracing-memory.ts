import { context, propagation, trace } from "@opentelemetry/api";
import {
	InMemorySpanExporter,
	type ReadableSpan,
	SimpleSpanProcessor,
	TracerProvider,
} from "@opentelemetry/sdk-trace";
import type { TTracing } from "./tracing.ts";
import { tracingRegister } from "./tracing-register.ts";

export type TTracingMemory = TTracing & {
	finished: () => readonly ReadableSpan[];
	reset: () => void;
};

export const tracingMemory = (service: string): TTracingMemory => {
	const exporter = new InMemorySpanExporter();
	const provider = new TracerProvider({
		spanProcessors: [new SimpleSpanProcessor({ exporter })],
	});

	tracingRegister(provider);

	const shutdown = async (): Promise<void> => {
		await provider.shutdown();
		trace.disable();
		context.disable();
		propagation.disable();
	};

	return {
		enabled: true,
		tracer: provider.getTracer(service),
		finished: (): readonly ReadableSpan[] => exporter.getFinishedSpans(),
		reset: (): void => exporter.reset(),
		shutdown,
	};
};
