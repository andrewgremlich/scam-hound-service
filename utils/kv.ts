type UserStoreValue = {
  usageCount: number;
  username: string;
  hashedPassword: string;
  roles: string[];
  apiKey: string;
};

type TokenStoreValue = {
  exp: number;
  iat: number;
  used: boolean;
};

const kv = await Deno.openKv();

export const listTokens = async () => {
  const keys = await kv.list<TokenStoreValue>({ prefix: ["tokenStoreValue"] });
  return keys;
};

export const deleteToken = async (token: string) => {
  await kv.delete(["tokenStoreValue", token]);
};

export const setToken = async (token: string, props: TokenStoreValue) => {
  await kv.set(["tokenStoreValue", token], props);
};

export const getToken = async (token: string): Promise<TokenStoreValue> => {
  return (await kv.get(["tokenStoreValue", token])).value as TokenStoreValue;
};

export const setEncryptKeyInStore = async (label: string, key: JsonWebKey) => {
  await kv.set(["encryptKeyInStore", label], key);
};

export const getEncryptKeyFromStore = async (
  label: string
): Promise<JsonWebKey | undefined> => {
  const privateKey = await kv.get<JsonWebKey>(["encryptKeyInStore", label]);

  if (!privateKey.value) {
    console.error(`No key found for ${label}`);
    return;
  }

  return privateKey.value;
};

export const getUserByUsername = async (
  username: string
): Promise<UserStoreValue> => {
  const user1 = await kv.get(["username", username]);

  if (!user1.value) {
    return {} as UserStoreValue;
  }

  const user2 = await kv.get(user1.value as string[]);

  return user2.value as UserStoreValue;
};

export const getUserById = async (apiKey: string): Promise<UserStoreValue> => {
  return (await kv.get(["apiKey", apiKey])).value as UserStoreValue;
};

export const setRegister = async (tokenRequirements: UserStoreValue) => {
  const primaryKey = ["apiKey", tokenRequirements.apiKey];
  const secondaryKey = ["username", tokenRequirements.username];

  const storedUser = await kv.set(primaryKey, tokenRequirements);
  await kv.set(secondaryKey, primaryKey);

  return storedUser;
};

export const removeRegister = async ({
  apiKey,
  username,
}: {
  apiKey: string;
  username: string;
}) => {
  await kv.delete(["username", username]);
  await kv.delete(["apiKey", apiKey]);
};
