import { Context } from "Oak";
import { z } from "zod";

export const issueOneTimeToken = async (ctx: Context) => {
  console.log("issue");

  // TODO: integrate with payment gateway.
  // TOOD: issue one time use tokens.
  // TODO: store Tokens individually in KV with expiration date.
  // TODO: a Deno cron job to clean  out all tokens that have been expired.
  // MAYBE: store token count per user in KV?

  ctx.response.body = `hello scam hound! ${Deno.env.get("OPENAI_KEY")}`;
};
