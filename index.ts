import { Application, Router } from "Oak";
import "dotenv";

import { scamHound } from "./routers/scamhound.ts";

import { cleanUpExpiredTokens } from "./utils/cronjobs.ts";

Deno.cron("Clean up expired tokens weekly", "15 4 * * 6", cleanUpExpiredTokens);

const api = new Router().use(
  "/api",
  scamHound.routes(),
  scamHound.allowedMethods()
);

await new Application().use(api.routes()).listen({ port: 8000 });
