import { hash, verify } from "scrypt";
import { decodeBase64Url } from "base64UrlEncode";

import { sign as JWTSign, verify as JWTVerify } from "./token.ts";
import { AuthorizationError } from "./errorHandler.ts";

const issuer = "scam-hound-service";

export const genApiKey = ({ exp, role }: { exp: number; role: string[] }) => {
  const now = Temporal.Now.instant().epochSeconds;

  return JWTSign({
    apiKey: window.crypto.randomUUID(),
    iat: now,
    exp,
    iss: issuer,
    role,
  });
};

export const genToken = ({ exp }: { exp: number }) => {
  const now = Temporal.Now.instant().epochSeconds;

  return JWTSign({
    iat: now,
    exp,
    iss: issuer,
  });
};

export const verifyToken = async (token: string) => {
  const [header, payload, signature] = token.split(".");
  const isVerified = await JWTVerify([header, payload].join("."), signature);
  const now = Temporal.Now.instant().epochSeconds;

  const decodedParsedPayload = JSON.parse(
    new TextDecoder().decode(decodeBase64Url(payload))
  );

  if (decodedParsedPayload.exp < now) {
    throw new AuthorizationError("Token has expired");
  }

  return isVerified;
};

export const hashData = (data: string) => {
  const hashed = hash(data);

  return hashed;
};

export const verifyHash = (raw: string, hashed: string) => {
  return verify(raw, hashed);
};
