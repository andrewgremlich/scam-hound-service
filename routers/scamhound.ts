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
    ctx.response.body = `hello scam hound! ${Deno.env.get("OPENAI_KEY")}`;
  });
