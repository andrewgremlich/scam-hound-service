import { Context } from "Oak";
import { z } from "zod";

import { removeRegister } from "~utils/kv.ts";
import { errorHandler } from "~utils/errorHandler.ts";

export const DeleteRegisterParams = z.object({
  username: z.string(),
});

export type DeleteRegisterParams = z.infer<typeof DeleteRegisterParams>;

export const deleteRegister = async (ctx: Context) => {
  try {
    const { username } = DeleteRegisterParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    await removeRegister(username);

    ctx.response.body = { username };
  } catch (e) {
    errorHandler(ctx, e);
  }
};
