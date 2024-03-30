import { Context } from "Oak";
import { z } from "zod";

import { verifyToken } from "~utils/register.ts";
import { getUserById } from "~utils/kv.ts";
import { decodeToken } from "~utils/register.ts";

export const VerifyTokenBody = z.object({
  token: z.string(),
});

export type VerifyTokenBody = z.infer<typeof VerifyTokenBody>;

export const verifyOneTimeToken = async (ctx: Context) => {
  const rawbody = await ctx.request.body.json();
  const { token: oneTimeUseToken } = VerifyTokenBody.parse(rawbody);
  const decodedOneTimeUse = decodeToken(oneTimeUseToken);

  const authHeader = ctx.request.headers.get("Authorization");
  const [_bearer, apiKey] = authHeader?.split(" ");

  const user = await getUserById(apiKey);
  user.usageCount += 1;

  decodedOneTimeUse.used = true;

  console.log(decodedOneTimeUse);
  console.log(decodeToken(apiKey));

  // TODO: increment counter on user and set in KV.
  // TODO: mark the token as used and set in KV.

  const verified = await verifyToken(oneTimeUseToken);

  ctx.response.body = { verified };
};
