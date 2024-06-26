import { Context } from "Oak";
import { z } from "zod";

import { errorHandler } from "~utils/errorHandler.ts";
import { genApiKey, hashData, verifyHash } from "~utils/register.ts";
import { getUserByUsername, setRegister } from "~utils/kv.ts";
import {
  inFourWeeksInMilliseconds,
  inFourWeeksInSeconds,
} from "~utils/constants.ts";

export const RegisterBody = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterBody = z.infer<typeof RegisterBody>;

/**
 * Register user to use the scam hound system
 * @param {string} username something to identiy the user
 * @param {string} password something that only the user should know
 * @returns Authorization header with the JWT token and returns the usage count in the body
 */
export const authRegister = async (ctx: Context) => {
  try {
    const rawbody = await ctx.request.body.json();
    const { username, password } = RegisterBody.parse(rawbody);
    const hashedPassword = hashData(password);
    const user = await getUserByUsername(username);

    if (user.apiKey) {
      const isPasswordMatch = verifyHash(password, user.hashedPassword);

      if (!isPasswordMatch) {
        ctx.response.status = 401;
        ctx.response.body = { error: "unauthorized" };
        return;
      }

      ctx.response.headers.set("Authorization", `Bearer ${user.apiKey}`);
      ctx.response.body = {
        usageCount: user.usageCount,
      };
      return;
    }

    const usageCount = 0;
    const roles = ["user"];
    const expirationDateInSeconds =
      Temporal.Now.instant().epochSeconds + inFourWeeksInSeconds;
    const expirationDateInMilliSeconds =
      Temporal.Now.instant().epochMilliseconds + inFourWeeksInMilliseconds;
    const apiKey = await genApiKey({ exp: expirationDateInSeconds, roles });

    await setRegister({
      username,
      apiKey,
      roles,
      hashedPassword,
      usageCount,
      expireIn: expirationDateInMilliSeconds,
    });

    ctx.response.headers.set("Authorization", `Bearer ${apiKey}`);
    ctx.response.body = { usageCount, expirationDate: expirationDateInSeconds };
  } catch (e) {
    errorHandler(ctx, e);
  }
};
