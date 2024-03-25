import { Router } from "Oak";

import { authRegister } from "./authRegister.ts";
import { isAuthorized } from "./isAuthorized.ts";
import { deleteRegister } from "./deleteRegister.ts";

export const scamHound = new Router()
  .post("/auth/register", authRegister)
  .use(isAuthorized)
  .delete("/auth/delete", deleteRegister)
  .get("/issue", (ctx) => {
    console.log("issue");

    // TOOD: issue one time use tokens.
    // TODO: integrate with payment gateway.
    // TODO: store Tokens individually in KV with expiration date.
    // TODO: a Deno cron job to clean  out all tokens that have been expired.
    // MAYBE: store token count per user in KV?

    ctx.response.body = `hello scam hound! ${Deno.env.get("OPENAI_KEY")}`;
  });

// TODO: verify issued one time use tokens.
// TODO: call OPEN AI with one time use tokens and text to check if it's scam. increment usagecount on user.
// MAYBE: call scam domain APIs (check notes) to see see if I can call them.