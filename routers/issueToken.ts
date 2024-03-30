import { Context } from "Oak";
import { z } from "zod";

import { inFourWeeksInSeconds } from "~utils/constants.ts";
import { genToken } from "~utils/register.ts";
import { setToken } from "~utils/kv.ts";
import { errorHandler } from "~utils/errorHandler.ts";

export const IssueTokenParams = z.object({
  numberToIssue: z
    .string()
    .transform(Number)
    .refine((v) => Number(v) >= 0, {
      message: "You must request at least one token.",
    })
    .refine((v) => Number(v) <= 10, {
      message: "Service can not issue more than 10.",
    }),
  certain: z.string().refine((v) => v === "yes", {
    message: "You must be certain to get tokens. Will cost money.",
  }),
});

export type IssueTokenParams = z.infer<typeof IssueTokenParams>;

export const issueToken = async (ctx: Context) => {
  // TODO: integrate with payment gateway.

  try {
    const { numberToIssue } = IssueTokenParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );
    const tokens = [];

    for (let i = 0; i < numberToIssue; i++) {
      const expirationDate =
        Temporal.Now.instant().epochSeconds + inFourWeeksInSeconds;
      const now = Temporal.Now.instant().epochSeconds;
      const JWTPayloadBit = {
        exp: expirationDate,
        iat: now,
        used: false,
        itemInSet: i + 1,
        numberInSet: numberToIssue,
        value: 0,
      };
      const token = await genToken(JWTPayloadBit);

      tokens.push(token);

      await setToken(token, JWTPayloadBit);
    }

    ctx.response.body = { tokens };
  } catch (err) {
    return errorHandler(ctx, err);
  }
};