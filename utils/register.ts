import { hash, verify } from "scrypt";

import { sign as JWTSign, verify as JWTVerify } from "./token.ts";

export const genApiKey = ({ exp, role }: { exp: number; role: string[] }) => {
  const now = Temporal.Now.instant().epochSeconds;

  return JWTSign({
    apiKey: window.crypto.randomUUID(),
    iat: now,
    exp,
    iss: "scam-hound-service",
    role,
  });
};

// export verifyApiKey = async (apiKey: string) => {
//   const now = Temporal.Now.instant().epochSeconds;

//   return JWTVerify(apiKey, now);
// }

export const hashData = (data: string) => {
  const hashed = hash(data);

  return hashed;
};

export const verifyHash = (raw: string, hashed: string) => {
  return verify(raw, hashed);
};
