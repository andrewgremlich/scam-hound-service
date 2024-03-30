import { Router } from "Oak";

import { authRegister } from "./authRegister.ts";
import { isAuthorized } from "./isAuthorized.ts";
import { deleteRegister } from "./deleteRegister.ts";
import { issueToken } from "./issueToken.ts";
import { verifyTokenAndUse } from "./verifyTokenAndUse.ts";

export const scamHound = new Router()
  .post("/auth/register", authRegister)
  .use(isAuthorized)
  .delete("/auth/register/delete", deleteRegister)
  .get("/token/issue", issueToken)
  .post("/token/verify", verifyTokenAndUse);

// --- These should be a different endpoint
// TODO: call OPEN AI with one time use tokens and text to check if it's scam. increment usagecount on user.
// MAYBE: a cron job to back up to turso?
// MAYBE: call scam domain APIs (check notes) to see see if I can call them.
