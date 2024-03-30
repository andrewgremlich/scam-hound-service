import { deleteToken, listTokens } from "./kv.ts";

export const cleanUpExpiredTokens = async () => {
  const tokens = await listTokens();

  for await (const entry of tokens) {
    const now = Temporal.Now.instant().epochSeconds;

    if (entry.value.exp < now) {
      await deleteToken(entry.key[1] as string);
    }
  }
};
