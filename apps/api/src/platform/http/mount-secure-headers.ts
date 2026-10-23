import type { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

export const SECURE_HEADER = {
	CONTENT_TYPE_OPTIONS: "X-Content-Type-Options",
	REFERRER_POLICY: "Referrer-Policy",
} as const;

export const SECURE_HEADER_VALUE = {
	NOSNIFF: "nosniff",
	STRICT_ORIGIN_WHEN_CROSS_ORIGIN: "strict-origin-when-cross-origin",
} as const;

export const secureHeadersMount = (app: Hono): void => {
	app.use(
		"*",
		secureHeaders({
			xContentTypeOptions: SECURE_HEADER_VALUE.NOSNIFF,
			referrerPolicy: SECURE_HEADER_VALUE.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
			crossOriginEmbedderPolicy: false,
			crossOriginResourcePolicy: false,
			crossOriginOpenerPolicy: false,
			originAgentCluster: false,
			strictTransportSecurity: false,
			xDnsPrefetchControl: false,
			xDownloadOptions: false,
			xFrameOptions: false,
			xPermittedCrossDomainPolicies: false,
			xXssProtection: false,
		}),
	);
};
