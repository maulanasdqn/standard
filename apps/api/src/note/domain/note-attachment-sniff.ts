import {
	NOTE_ATTACHMENT_CONTENT_TYPE,
	type TNoteAttachmentContentType,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";

type TSignature = {
	contentType: TNoteAttachmentContentType;
	parts: readonly { offset: number; bytes: readonly number[] }[];
};

const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];
const WEBP_TAG_OFFSET = 8;

const SIGNATURES: readonly TSignature[] = [
	{
		contentType: NOTE_ATTACHMENT_CONTENT_TYPE.PNG,
		parts: [
			{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
		],
	},
	{
		contentType: NOTE_ATTACHMENT_CONTENT_TYPE.JPEG,
		parts: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
	},
	{
		contentType: NOTE_ATTACHMENT_CONTENT_TYPE.GIF,
		parts: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }],
	},
	{
		contentType: NOTE_ATTACHMENT_CONTENT_TYPE.GIF,
		parts: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }],
	},
	{
		contentType: NOTE_ATTACHMENT_CONTENT_TYPE.WEBP,
		parts: [
			{ offset: 0, bytes: RIFF },
			{ offset: WEBP_TAG_OFFSET, bytes: WEBP },
		],
	},
];

const matches = (body: Uint8Array, signature: TSignature): boolean =>
	A.all(signature.parts, (part): boolean =>
		A.all(
			A.mapWithIndex(
				part.bytes,
				(index, byte): boolean => body[part.offset + index] === byte,
			),
			(same): boolean => same,
		),
	);

export const noteAttachmentContentTypeSniff = (
	body: Uint8Array,
): TNoteAttachmentContentType | null =>
	A.find(SIGNATURES, (signature): boolean => matches(body, signature))
		?.contentType ?? null;
