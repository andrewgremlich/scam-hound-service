import { Context } from "Oak";
import { z } from "zod";

import { removeRegister, getUserById } from "~utils/kv.ts";
import { errorHandler, AuthorizationError } from "~utils/errorHandler.ts";

export const DeleteRegisterParams = z.object({
  certain: z.string().refine((v) => v === "yes", {
    message: "You must be certain to delete this register.",
  }),
  tokenToDelete: z.string(),
});

export type DeleteRegisterParams = z.infer<typeof DeleteRegisterParams>;

/**
 * 
 * @param {string} tokenToDelete the token to delete the user
 * @param {'yes'|'no'|undefined} certain the user is certain to delete the user
 * @returns a confirmation that the user is deleted
 */
export const deleteRegister = async (ctx: Context) => {
  try {
    const { tokenToDelete } = DeleteRegisterParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    console.log(tokenToDelete);

    const authHeader = ctx.request.headers.get("Authorization");
    const apiKey = authHeader!.split(" ")[1];
    const user = await getUserById(apiKey);

    if (!user.roles.includes("admin")) {
      throw new AuthorizationError("User not authorized");
    }

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    await removeRegister({ apiKey, username: user.username });

    ctx.response.body = { data: "user deleted" };
  } catch (e) {
    return errorHandler(ctx, e);
  }
};
