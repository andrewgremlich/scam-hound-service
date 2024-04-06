import { Context } from "Oak";

export const urlInfo = async (ctx: Context) => {
  const urlScanApiKey = Deno.env.get("URL_SCAN_API_KEY");
  const urlscanioResponse = await fetch("https://urlscan.io/api/v1/scan/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "API-Key": urlScanApiKey ?? "",
    },
    body: JSON.stringify({
      url: "gremlich.me",
      visibility: "public",
    }),
  });

  const urlscanioJson = await urlscanioResponse.json();

  ctx.response.body = urlscanioJson;
};
