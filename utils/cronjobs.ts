import { deleteToken, listTokens } from "./kv.ts";

export const cleanUpExpiredTokens = async () => {
  const tokens = await listTokens();

  for await (const entry of tokens) {
    const expirationDate = Temporal.Now.instant().epochSeconds;

    if (entry.value.exp < expirationDate) {
      await deleteToken(entry.key[1] as string);
    }
  }
};
