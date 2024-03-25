import { Context } from "Oak";
import { z } from "zod";

import { removeRegisterById, getUserById } from "~utils/kv.ts";
import { errorHandler, AuthorizationError } from "~utils/errorHandler.ts";

export const DeleteRegisterParams = z.object({
  certain: z.string().refine((v) => v === "yes", {
    message: "You must be certain to delete your account.",
  }),
});

export type DeleteRegisterParams = z.infer<typeof DeleteRegisterParams>;

export const deleteRegister = async (ctx: Context) => {
  try {
    DeleteRegisterParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    const authHeader = ctx.request.headers.get("Authorization");
    const token = authHeader!.split(" ")[1];
    const user = await getUserById(token);

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    await removeRegisterById(token);

    ctx.response.body = { data: "user deleted" };
  } catch (e) {
    return errorHandler(ctx, e);
  }
};
