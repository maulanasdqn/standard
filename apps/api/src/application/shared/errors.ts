import { Schema } from "effect";

export class ENotFound extends Schema.TaggedError<ENotFound>()("ENotFound", {
	message: Schema.String,
}) {}

export class EForbidden extends Schema.TaggedError<EForbidden>()("EForbidden", {
	message: Schema.String,
}) {}

export class EUnauthorized extends Schema.TaggedError<EUnauthorized>()(
	"EUnauthorized",
	{
		message: Schema.String,
	},
) {}

export class EDatabase extends Schema.TaggedError<EDatabase>()("EDatabase", {
	cause: Schema.Defect(),
}) {}

export class EAuth extends Schema.TaggedError<EAuth>()("EAuth", {
	cause: Schema.Defect(),
}) {}

export class EQueue extends Schema.TaggedError<EQueue>()("EQueue", {
	cause: Schema.Defect(),
}) {}

export type TDomainError =
	| ENotFound
	| EForbidden
	| EUnauthorized
	| EDatabase
	| EAuth
	| EQueue;
