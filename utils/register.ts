import { hash, verify } from "scrypt";
import { decodeBase64Url } from "base64UrlEncode";

import { sign as JWTSign, verify as JWTVerify } from "./token.ts";
import { AuthorizationError } from "./errorHandler.ts";

const issuer = "scam-hound-service";

export const genApiKey = ({ exp, roles }: { exp: number; roles: string[] }) => {
  const now = Temporal.Now.instant().epochSeconds;

  return JWTSign({
    iat: now,
    exp,
    iss: issuer,
    roles,
  });
};

export const genToken = (props: { exp: number; iat: number }) => {
  return JWTSign({
    iss: issuer,
    ...props,
  });
};

export const decodeToken = (token: string) => {
  const [_header, payload, _signature] = token.split(".");

  return JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
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
