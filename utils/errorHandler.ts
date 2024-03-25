import { Context } from "Oak";
import { z } from "zod";

export class AuthorizationError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TokenIssueError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TokenUseError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export const errorHandler = (
  ctx: Context,
  error: z.ZodError | SyntaxError | AuthorizationError | Error
) => {
  if (error instanceof z.ZodError) {
    ctx.response.status = 400;
    ctx.response.body = { error: true, data: error.errors };
    return;
  }

  if (error instanceof SyntaxError) {
    ctx.response.status = 400;
    ctx.response.body = { error: true, data: error.message };
    return;
  }

  if (error instanceof AuthorizationError) {
    ctx.response.status = 401;
    ctx.response.body = { error: true, data: error.message };
    return;
  }

  const DENO_ENV = Deno.env.get("DENO_ENV");

  if (DENO_ENV === "development") {
    console.error(error);
  }

  ctx.response.status = 500;
  ctx.response.body = { error: true, data: "Something went wrong" };
};
