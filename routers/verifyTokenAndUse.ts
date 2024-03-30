import { Context } from "Oak";
import { z } from "zod";

import { verifyToken } from "~utils/register.ts";
import { getUserById, getToken } from "~utils/kv.ts";
import { setToken, setRegister } from "~utils/kv.ts";
import { errorHandler } from "~utils/errorHandler.ts";
import { checkTextForScam } from "~utils/checkTextForScam.ts";

export const VerifyTokenBody = z.object({
  token: z.string(),
  textScamCheck: z.string(),
});

export type VerifyTokenBody = z.infer<typeof VerifyTokenBody>;

export const VerifyTokenParams = z.object({
  certain: z.string().refine((v) => v === "yes", {
    message: "You must be certain to use this token. It is irreversible.",
  }),
});

export type VerifyTokenParams = z.infer<typeof VerifyTokenParams>;

export const verifyTokenAndUse = async (ctx: Context) => {
  try {
    VerifyTokenParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    const rawbody = await ctx.request.body.json();
    const { token: oneTimeUseToken, textScamCheck } =
      VerifyTokenBody.parse(rawbody);
    const authHeader = ctx.request.headers.get("Authorization");
    const [_bearer, apiKey] = authHeader?.split(" ") ?? [];
    const user = await getUserById(apiKey);
    const checkForUse = await getToken(oneTimeUseToken);

    if (checkForUse.used) {
      ctx.response.body = { verified: false, message: "Token has been used" };
      return;
    }

    const verified = await verifyToken(oneTimeUseToken);

    if (!verified) {
      ctx.response.body = {
        verified: false,
        message: "This service didn't issue that token out.",
      };
      return;
    }

    await setToken(oneTimeUseToken, { ...checkForUse, used: true });

    user.usageCount += 1;
    await setRegister(user);

    const queryAi = await checkTextForScam(textScamCheck);

    console.log(queryAi);

    ctx.response.body = {
      usageCount: user.usageCount,
      verified: true,
      message: queryAi.message.content,
    };
  } catch (err) {
    return errorHandler(ctx, err);
  }
};
