import { decodeBase64Url, encodeBase64Url } from "base64UrlEncode";

import { getSigningKey } from "./keys.ts";

const headerOptions = {
  alg: "HMAC",
  typ: "JWT",
};
const JWTHeader = encodeBase64Url(
  JSON.stringify({ ...headerOptions, alg: "HS512" })
);

export const sign = async (rawpayload: {
  [key: string]: string | number | string[];
}): Promise<string> => {
  const key = await getSigningKey();
  const payload = encodeBase64Url(JSON.stringify(rawpayload));
  const hashSigningInput = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(`${JWTHeader}.${payload}`)
  );
  const rawsignature = await crypto.subtle.sign(
    headerOptions.alg,
    key,
    hashSigningInput
  );
  const signature = encodeBase64Url(rawsignature);

  return `${JWTHeader}.${payload}.${signature}`;
};

export const verify = async (signingInput: string, signature: string) => {
  const key = await getSigningKey();
  const rawsignature = decodeBase64Url(signature);
  const hashSigningInput = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(signingInput)
  );

  const result = await crypto.subtle.verify(
    headerOptions.alg,
    key,
    rawsignature,
    hashSigningInput
  );

  return result;
};
