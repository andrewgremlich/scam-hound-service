import { Context } from "Oak";
import { z } from "zod";

import { verifyToken } from "~utils/register.ts";
import { getToken } from "~utils/kv.ts";

export const VerifyTokenBody = z.object({
  token: z.string(),
});

export type VerifyTokenBody = z.infer<typeof VerifyTokenBody>;

export const verifyOneTimeToken = async (ctx: Context) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { error: "missing token" };
    return;
  }

  // const [_bearer, token] = authHeader.split(" ");
  // TODO: count for user
  // TODO: increment counter on user.

  const rawbody = await ctx.request.body.json();
  const { token } = VerifyTokenBody.parse(rawbody);
  const verified = await verifyToken(token);

  console.log(verified);

  ctx.response.body = "hello world";
};
