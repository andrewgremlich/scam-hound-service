import { Router } from "Oak";

import { AppState } from "../index.ts";

import { authRegister } from "./authRegister.ts";
import { isAuthorized } from "./isAuthorized.ts";
import { deleteRegister } from "./deleteRegister.ts";
import { issueOneTimeToken } from "./issueOneTimeToken.ts";

export const scamHound = new Router<AppState>()
  .post("/auth/register", authRegister)
  .use(isAuthorized)
  .delete("/auth/register/delete", deleteRegister)
  .get("/token/issue", issueOneTimeToken)
  .post("/token/verify", async (ctx) => {
    // TODO: verify issued one time use tokens.
  });

// --- These should be a different endpoint
// TODO: call OPEN AI with one time use tokens and text to check if it's scam. increment usagecount on user.
// MAYBE: call scam domain APIs (check notes) to see see if I can call them.
