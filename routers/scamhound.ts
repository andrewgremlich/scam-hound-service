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
  .post("/scam-check/ai-query", verifyTokenAndUse);

  
  // --- These should be a different endpoint
  // TODO?: another endpoint querying the scam domain APIs?
// MAYBE: a cron job to back up to turso?
// MAYBE: call scam domain APIs (check notes) to see see if I can call them.
