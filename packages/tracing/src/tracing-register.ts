import {
	context,
	propagation,
	type TracerProvider,
	trace,
} from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

export const tracingRegister = (provider: TracerProvider): void => {
	context.setGlobalContextManager(
		new AsyncLocalStorageContextManager().enable(),
	);
	propagation.setGlobalPropagator(new W3CTraceContextPropagator());
	trace.setGlobalTracerProvider(provider);
};
