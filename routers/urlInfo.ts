import { Context } from "Oak";

const urlScan = async () => {
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

  return urlscanioResponse;
};

const scamalytics = async () => {
  const scamalyticsApiKey = Deno.env.get("SCAMALYTICS_API_KEY");
  const scamalyticsUrl = Deno.env.get("SCAMALYTICS_URL");

  const scamalyticsResponse = await fetch(
    `${scamalyticsUrl}/?key=${scamalyticsApiKey}&ip=216.58.194.174`
  );
  const scamalyticsJson = await scamalyticsResponse.json();

  return scamalyticsJson;
};

export const urlInfo = async (ctx: Context) => {
  ctx.response.body = { urlInfo: "urlInfo" };
};

// https://docs.virustotal.com/reference/public-vs-premium-api
// https://developers.google.com/safe-browsing/reference
// https://docs.abuseipdb.com/#configuring-fail2ban
// API service? https://rapidapi.com/