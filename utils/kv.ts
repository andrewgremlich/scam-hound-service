import { AuthorizationError } from "~utils/errorHandler.ts";

type UserStoreValue = {
  usageCount: number;
  expirationDate: number;
  username: string;
  hashedPassword: string;
  role: string[];
  apiKey: string;
};

const kv = await Deno.openKv();

export const setKey = async (label: string, key: JsonWebKey) => {
  await kv.set([label], key);
};

export const getKey = async (
  label: string
): Promise<JsonWebKey | undefined> => {
  const privateKey = await kv.get<JsonWebKey>([label]);

  if (!privateKey.value) {
    console.error(`No key found for ${label}`);
    return;
  }

  return privateKey.value;
};

export const getUser = async (username: string): Promise<UserStoreValue> => {
  const user = await kv.get([username]);
  const userValue = user.value as UserStoreValue;

  return userValue;
};

export const getUserById = async (id: string): Promise<UserStoreValue> => {
  return (await kv.get([id])).value as UserStoreValue;
};

export const setRegister = async (
  id: string,
  tokenRequirements: UserStoreValue
) => {
  const primaryKey = [id];
  const byUsername = [tokenRequirements.username];

  const res = await kv
    .atomic()
    .check({ key: primaryKey, versionstamp: null })
    .check({ key: byUsername, versionstamp: null })
    .set(primaryKey, tokenRequirements)
    .set(byUsername, tokenRequirements)
    .commit();

  if (!res.ok) {
    throw new AuthorizationError(
      "User with username and password already exists."
    );
  }
};

export const removeRegisterById = async (id: string) => {
  await kv.delete([id]);
};
