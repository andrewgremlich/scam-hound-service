// https://docs.virustotal.com/reference/public-vs-premium-api
// https://developers.google.com/safe-browsing
// https://docs.abuseipdb.com/#configuring-fail2ban
// API service? https://rapidapi.com/
import { Context } from "Oak";
import { z } from "zod";

import { errorHandler } from "~utils/errorHandler.ts";

const virustotal = async (domain: string) => {
  const virustotalApiKey = Deno.env.get("VIRUSTOTAL_API_KEY");

  const virustotalResponse = await fetch(
    `https://www.virustotal.com/api/v3/domains/${domain}`,
    {
      headers: {
        "X-Apikey": virustotalApiKey ?? "",
      },
    }
  );

  console.log(virustotalResponse);

  const virustotalJson = await virustotalResponse.json();

  return virustotalJson;
};

const urlScan = async (domain: string) => {
  const urlScanApiKey = Deno.env.get("URL_SCAN_API_KEY");

  const urlscanioResponse = await fetch("https://urlscan.io/api/v1/scan/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "API-Key": urlScanApiKey ?? "",
    },
    body: JSON.stringify({
      url: domain,
      visibility: "public",
    }),
  });

  const urlscanioJson = await urlscanioResponse.json();

  return urlscanioResponse;
};

async function getDomainIpAddress(domain: string): Promise<string[]> {
  try {
    const addresses = Deno.resolveDns(domain, "A");
    return addresses;
  } catch (error) {
    console.error(`Error looking up IP address for ${domain}: ${error}`);
    return [];
  }
}

const scamalytics = async () => {
  const scamalyticsApiKey = Deno.env.get("SCAMALYTICS_API_KEY");
  const scamalyticsUrl = Deno.env.get("SCAMALYTICS_URL");

  const scamalyticsResponse = await fetch(
    `${scamalyticsUrl}/?key=${scamalyticsApiKey}&ip=216.58.194.174`
  );
  const scamalyticsJson = await scamalyticsResponse.json();

  return scamalyticsJson;
};

const UrlInfoParams = z.object({
  urlToScan: z.string(),
});

type UrlInfoParams = z.infer<typeof UrlInfoParams>;

export const urlInfo = async (ctx: Context) => {
  try {
    const { urlToScan } = UrlInfoParams.parse(
      Object.fromEntries(ctx.request.url.searchParams.entries())
    );

    const response = await getDomainIpAddress(urlToScan);

    console.log(response);

    ctx.response.body = { urlInfo: "urlInfo" };
  } catch (error) {
    return errorHandler(ctx, error);
  }
};
