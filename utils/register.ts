import { hash, verify } from "scrypt";

import { sign as JWTSign, verify as JWTVerify } from "./token.ts";
import { inFourWeeksInSeconds } from "~utils/constants.ts";

export const genApiKey = () => {
  const now = Temporal.Now.instant().epochSeconds;

  return JWTSign({
    apiKey: window.crypto.randomUUID(),
    iat: now,
    exp: now + inFourWeeksInSeconds,
    iss: "scam-hound-service",
  });
};

// export verifyApiKey = async (apiKey: string) => {
//   const now = Temporal.Now.instant().epochSeconds;

//   return JWTVerify(apiKey, now);
// }

export const hashPassword = (password: string) => {
  const hashed = hash(password);

  return {
    hashed,
  };
};

export const verifyHash = (raw: string, hashed: string) => {
  return verify(raw, hashed);
};
