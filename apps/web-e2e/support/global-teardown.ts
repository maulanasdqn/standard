export default async function globalTeardown(): Promise<void> {
	const pid = process.env.__WEB_E2E_API_PID__;
	if (pid) {
		try {
			process.kill(-Number(pid));
		} catch {
			// already gone
		}
	}
}
