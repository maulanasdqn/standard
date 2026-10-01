import { createHmac } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_MS = 30_000;
const DIGITS = 6;
const SECRET_PARAM = "secret";

const base32Decode = (encoded: string): Buffer => {
	const bits = [...encoded.replace(/=+$/, "")]
		.map((char) => BASE32.indexOf(char).toString(2).padStart(5, "0"))
		.join("");
	const bytes: number[] = [];
	for (let index = 0; index + 8 <= bits.length; index += 8) {
		bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
	}
	return Buffer.from(bytes);
};

export const totpSecretOf = (uri: string): string =>
	new URL(uri).searchParams.get(SECRET_PARAM) ?? "";

export const totpCode = (secret: string): string => {
	const counter = Buffer.alloc(8);
	counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / STEP_MS)));
	const digest = createHmac("sha1", base32Decode(secret))
		.update(counter)
		.digest();
	const offset = (digest.at(-1) ?? 0) & 15;
	const value = digest.readUInt32BE(offset) & 0x7fffffff;
	return String(value % 10 ** DIGITS).padStart(DIGITS, "0");
};
