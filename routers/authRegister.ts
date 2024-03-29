import { Context } from "Oak";
import { z } from "zod";

import { AuthorizationError, errorHandler } from "~utils/errorHandler.ts";
import { genApiKey, hashData, hashedId } from "~utils/register.ts";
import { getUser, setRegister } from "~utils/kv.ts";
import { inFourWeeksInSeconds } from "~utils/constants.ts";

export const RegisterBody = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterBody = z.infer<typeof RegisterBody>;

export const authRegister = async (ctx: Context) => {
  if (!ctx.request.body.has) {
    ctx.response.status = 400;
    ctx.response.body = { error: "missing body" };
    return;
  }

  try {
    const rawbody = await ctx.request.body.json();
    const { username, password } = RegisterBody.parse(rawbody);
    const hashedPassword = hashData(password);
    const user = await getUser(username);

    if (user) {
      ctx.response.headers.set("Authorization", `Bearer ${user.apiKey}`);
      ctx.response.body = {
        usageCount: user.usageCount,
        expirationDate: user.expirationDate,
      };
      return;
    }

    const usageCount = 0;
    const role = ["user"];
    const expirationDate =
      Temporal.Now.instant().epochSeconds + inFourWeeksInSeconds;
    const apiKey = await genApiKey({ exp: expirationDate, role });

    await setRegister(apiKey, {
      username,
      apiKey,
      role,
      hashedPassword,
      usageCount,
      expirationDate,
    });

    ctx.response.headers.set("Authorization", `Bearer ${apiKey}`);
    ctx.response.body = { usageCount, expirationDate };
  } catch (e) {
    errorHandler(ctx, e);
  }
};
