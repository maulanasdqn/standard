import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const API_URL = process.env.VITE_API_URL ?? "http://localhost:3001";

export default defineConfig({
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			routeFileIgnorePattern:
				"^(_apis|_components|_data|_hooks|_constants|_utils)",
		}),
		viteReact(),
	],
	server: {
		proxy: {
			"/api": { target: API_URL, changeOrigin: true },
			"/rpc": { target: API_URL, changeOrigin: true },
		},
	},
});
