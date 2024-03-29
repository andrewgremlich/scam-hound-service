import { Context } from "Oak";

import { inFourWeeksInSeconds } from "~utils/constants.ts";
import { genToken } from "~utils/register.ts";
import { setToken } from "~utils/kv.ts";

export const issueOneTimeToken = async (ctx: Context) => {
  // TODO: integrate with payment gateway.

  const expirationDate =
    Temporal.Now.instant().epochSeconds + inFourWeeksInSeconds;
  const now = Temporal.Now.instant().epochSeconds;
  const JWTPayloadBit = { exp: expirationDate, iat: now, used: false };
  const token = await genToken(JWTPayloadBit);

  await setToken(token, JWTPayloadBit);

  ctx.response.body = { token };
};
