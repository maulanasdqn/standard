import type {
	TUser,
	TUserCreateInput,
	TUserIdInput,
	TUserList,
	TUserListInput,
	TUserPasswordResetInput,
	TUserUpdateInput,
} from "@app/schemas";
import type {
	TApplicationEffect,
	TBaseApplication,
} from "#/shared/base-application.ts";
import { userCreate } from "#/user/application/user-create.ts";
import { userDelete } from "#/user/application/user-delete.ts";
import { userGet } from "#/user/application/user-get.ts";
import { userList } from "#/user/application/user-list.ts";
import { userPasswordReset } from "#/user/application/user-password-reset.ts";
import { userUpdate } from "#/user/application/user-update.ts";

export const userApplication = {
	list: userList,
	get: userGet,
	create: userCreate,
	update: userUpdate,
	remove: userDelete,
	resetPassword: userPasswordReset,
} satisfies TBaseApplication<
	TUser,
	TUserList,
	TUserIdInput,
	{
		list: TUserListInput;
		get: TUserIdInput;
		create: TUserCreateInput;
		update: TUserUpdateInput;
		remove: TUserIdInput;
	}
> & {
	readonly resetPassword: (
		input: TUserPasswordResetInput,
		actorId: string,
	) => TApplicationEffect<TUserIdInput>;
};
