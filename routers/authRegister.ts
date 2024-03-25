import { Context } from "Oak";
import { z } from "zod";

import { AuthorizationError, errorHandler } from "~utils/errorHandler.ts";
import { genApiKey, hashPassword } from "~utils/register.ts";
import { getUser, setRegister } from "~utils/kv.ts";
import { inFourWeeksInSeconds } from "~utils/constants.ts";

export const RegisterParams = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterParams = z.infer<typeof RegisterParams>;

export const authRegister = async (ctx: Context) => {
  if (!ctx.request.body.has) {
    ctx.response.status = 400;
    ctx.response.body = { error: "missing body" };
    return;
  }

  try {
    const rawbody = await ctx.request.body.json();
    const { username, password } = RegisterParams.parse(rawbody);
    const user = await getUser(username);

    if (user) {
      throw new AuthorizationError("User already exists.");
    }

    const hashAndEncryptPassword = hashPassword(password);
    const now = Temporal.Now.instant().epochSeconds;
    const apiKey = await genApiKey();
    const usageCount = 0;
    const expirationDate = now + inFourWeeksInSeconds;

    await setRegister(username, {
      hashedPassword: hashAndEncryptPassword.hashed,
      usageCount,
      expirationDate,
      apiKey,
    });

    ctx.response.headers.set("Authorization", `Bearer ${apiKey}`);
    ctx.response.body = { username, usageCount, expirationDate };
  } catch (e) {
    errorHandler(ctx, e);
  }
};
