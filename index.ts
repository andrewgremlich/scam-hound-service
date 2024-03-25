import { Application, Router } from "Oak";
import "dotenv";

import { scamHound } from "./routers/scamhound.ts";

const api = new Router()
  .use("/api", scamHound.routes(), scamHound.allowedMethods());

await new Application().use(api.routes()).listen({ port: 8000 });
