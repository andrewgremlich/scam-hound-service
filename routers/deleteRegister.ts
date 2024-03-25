import { Context } from "Oak";
import { z } from "zod";

import { removeRegister, getUser } from "~utils/kv.ts";
import { errorHandler, AuthorizationError } from "~utils/errorHandler.ts";
import { verifyHash } from "~utils/register.ts";

export const DeleteRegisterBody = z.object({
  username: z.string(),
  password: z.string(),
});

export type DeleteRegisterBody = z.infer<typeof DeleteRegisterBody>;

export const DeleteRegisterParams = z.object({
  certain: z.string().refine((v) => v === "yes", {
    message: "You must be certain to delete your account.",
  }),
});

export type DeleteRegisterParams = z.infer<typeof DeleteRegisterParams>;

export const deleteRegister = async (ctx: Context) => {
  try {
    const rawbody = await ctx.request.body.json();

    DeleteRegisterParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    const { username, password } = DeleteRegisterBody.parse(rawbody);
    const user = await getUser(username);
    const passwordVerified = verifyHash(password, user.hashedPassword);

    if (!passwordVerified) {
      throw new AuthorizationError("Invalid password");
    }

    await removeRegister(username);

    ctx.response.body = { username };
  } catch (e) {
    if (e instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: true, data: e.issues };
      return;
    }

    return errorHandler(ctx, e);
  }
};
