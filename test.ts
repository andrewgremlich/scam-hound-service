import { fail, equal } from "assert";

const host = "http://localhost:8000";
const registerOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};
let authorization = "";
let oneTimeUserToken = "";

Deno.test("register new user", async () => {
  const response = await fetch(`${host}/api/auth/register`, {
    ...registerOptions,
    body: JSON.stringify({
      username: "gremlich@duck.com",
      password: "password",
    }),
  });
  const data = await response.json();
  const headers = response.headers;

  if (!headers.get("Authorization")) {
    fail("Authorization header not set");
  }

  authorization = headers.get("Authorization") as string;

  equal(response.status, 200);
  equal(data.usageCount, 0);
});

Deno.test("don't register new user with missing body", async () => {
  const response = await fetch(`${host}/api/auth/register`, {
    ...registerOptions,
  });
  await response.json();

  equal(response.status, 400);
});

Deno.test("fetch token with user authorization", async () => {
  const response = await fetch(
    `${host}/api/token/issue?numberToIssue=1&certain=yes`,
    {
      method: "GET",
      headers: {
        Authorization: authorization,
      },
    }
  );
  const data = await response.json();

  oneTimeUserToken = data.tokens[0];

  equal(response.status, 200);
  equal(typeof data.token, "string");
});

Deno.test("don't fetch token with missing authorization", async () => {
  const response = await fetch(
    `${host}/api/token/issue?numberToIssue=1&certain=yes`,
    {
      method: "GET",
    }
  );
  const data = await response.json();

  equal(response.status, 401);
  equal(data.error, "missing token");
});

Deno.test("verify one time token with user authorization", async () => {
  const response = await fetch(`${host}/api/scam-check/ai-query`, {
    ...registerOptions,
    headers: {
      Authorization: authorization,
    },
    body: JSON.stringify({
      token: oneTimeUserToken,
      textScamCheck:
        "Congratulations! We are delighted to inform you that you have emerged as the lucky winner of our prestigious Global Lottery Jackpot. After a rigorous selection process, your email address was chosen as one of the fortunate winners in our random draw.",
    }),
  });
  const data = await response.json();

  equal(response.status, 200);
  equal(data.verified, true);
});

Deno.test(
  "don't verify one time token with missing authorization",
  async () => {
    const response = await fetch(`${host}/api/scam-check/ai-query`, {
      ...registerOptions,
      body: JSON.stringify({
        token: oneTimeUserToken,
      }),
    });
    const data = await response.json();

    equal(response.status, 401);
    equal(data.error, "missing token");
  }
);

Deno.test("don't verify one time token with missing body", async () => {
  const response = await fetch(`${host}/api/scam-check/ai-query`, {
    ...registerOptions,
    headers: {
      Authorization: authorization,
    },
  });
  const data = await response.json();

  equal(response.status, 400);
  equal(data.error, "missing body");
});

Deno.test("don't verify one time token with invalid token", async () => {
  const response = await fetch(`${host}/api/scam-check/ai-query`, {
    ...registerOptions,
    headers: {
      Authorization: authorization,
    },
    body: JSON.stringify({
      token: "invalid",
    }),
  });
  const data = await response.json();

  equal(response.status, 200);
  equal(data.verified, false);
});
