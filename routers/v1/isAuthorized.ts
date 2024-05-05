import { Context } from "Oak";

import { errorHandler } from "~utils/errorHandler.ts";
import { verifyToken } from "~utils/register.ts";

/**
 * 
 * @param authorization the JWT in the authorization header
 * @returns permits the user to access the service
 */
export const isAuthorized = async (
  ctx: Context,
  next: () => Promise<unknown>
) => {
  try {
    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = { error: "missing token" };
      return;
    }

    const [_bearer, token] = authHeader.split(" ");
    const isVerified = await verifyToken(token);

    if (!isVerified) {
      ctx.response.status = 401;
      ctx.response.body = { error: "invalid token" };
      return;
    }

    await next();
  } catch (error) {
    return errorHandler(ctx, error);
  }
};
