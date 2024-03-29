import { Context } from "Oak";
import { decodeBase64Url } from "base64UrlEncode";

import { verify } from "~utils/token.ts";

export const isAuthorized = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { error: "missing token" };
    return;
  }

  const [_bearer, token] = authHeader.split(" ");
  const [header, payload, signature] = token.split(".");
  const isVerified = await verify([header, payload].join("."), signature);

  if (!isVerified) {
    ctx.response.status = 401;
    ctx.response.body = { error: "invalid token" };
    return;
  }

  const decodedParsedPayload = JSON.parse(
    new TextDecoder().decode(decodeBase64Url(payload))
  );
  const now = Temporal.Now.instant().epochSeconds;

  if (decodedParsedPayload.exp < now) {
    ctx.response.status = 401;
    ctx.response.body = { error: "token expired" };
    return;
  }

  await next();
};
