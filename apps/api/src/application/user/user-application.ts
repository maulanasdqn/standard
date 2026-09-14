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
} from "#/application/shared/base-application.ts";
import { userCreate } from "#/application/user/user-create.ts";
import { userDelete } from "#/application/user/user-delete.ts";
import { userGet } from "#/application/user/user-get.ts";
import { userList } from "#/application/user/user-list.ts";
import { userPasswordReset } from "#/application/user/user-password-reset.ts";
import { userUpdate } from "#/application/user/user-update.ts";

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
