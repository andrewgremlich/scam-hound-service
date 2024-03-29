import { Context } from "Oak";
import { z } from "zod";

import { inFourWeeksInSeconds } from "~utils/constants.ts";
import { genToken } from "~utils/register.ts";

export const issueOneTimeToken = async (ctx: Context) => {
  console.log("issue");

  // TODO: integrate with payment gateway.

  // TODO: issue one time use tokens.
  const expirationDate =
    Temporal.Now.instant().epochSeconds + inFourWeeksInSeconds;
  const token = await genToken({ exp: expirationDate });

  console.log(token);

  // TODO: store Tokens individually in KV with expiration date.
  // TODO: a Deno cron job to clean  out all tokens that have been expired.
  // MAYBE: store token count per user in KV?

  ctx.response.body = `hello scam hound! ${Deno.env.get("OPENAI_KEY")}`;
};
