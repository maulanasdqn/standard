import { API_BASE_PATH, WEB_BASE_PATH } from "@app/contract";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const ENV_KEY = {
	SITE_URL: "LANDING_SITE_URL",
	WEB_DEV_URL: "WEB_DEV_URL",
	API_DEV_URL: "API_DEV_URL",
} as const;

const DEFAULT_SITE_URL = "http://localhost:4321";
const DEFAULT_WEB_DEV_URL = "http://localhost:5173";
const DEFAULT_API_DEV_URL = "http://localhost:3001";
const NEVER_INLINE = 0;

const routesUnder = (basePath: string): string => `^${basePath}(/|$)`;

export default defineConfig({
	site: process.env[ENV_KEY.SITE_URL] || DEFAULT_SITE_URL,
	trailingSlash: "always",
	markdown: {
		syntaxHighlight: "prism",
	},
	build: {
		inlineStylesheets: "never",
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			assetsInlineLimit: NEVER_INLINE,
		},
		server: {
			proxy: {
				[routesUnder(WEB_BASE_PATH)]: {
					target: process.env[ENV_KEY.WEB_DEV_URL] || DEFAULT_WEB_DEV_URL,
					changeOrigin: true,
					ws: true,
				},
				[routesUnder(API_BASE_PATH)]: {
					target: process.env[ENV_KEY.API_DEV_URL] || DEFAULT_API_DEV_URL,
					changeOrigin: true,
				},
			},
		},
	},
});
