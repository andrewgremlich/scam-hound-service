import { Router } from "Oak";

import { authRegister } from "./authRegister.ts";
import { isAuthorized } from "./isAuthorized.ts";
import { deleteRegister } from "./deleteRegister.ts";
import { issueOneTimeToken } from "./issueOneTimeToken.ts";
import { verifyOneTimeToken } from "./verifyOneTimeToken.ts";

export const scamHound = new Router()
  .post("/auth/register", authRegister)
  .use(isAuthorized)
  .delete("/auth/register/delete", deleteRegister)
  .get("/token/oneTime/issue", issueOneTimeToken)
  .post("/token/oneTime/verify", verifyOneTimeToken);

// --- These should be a different endpoint
// TODO: call OPEN AI with one time use tokens and text to check if it's scam. increment usagecount on user.
// MAYBE: a cron job to back up to turso?
// MAYBE: call scam domain APIs (check notes) to see see if I can call them.
