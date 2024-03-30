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

Deno.test("no register new user can return error with missing body", async () => {
  const response = await fetch(`${host}/api/auth/register`, {
    ...registerOptions,
  });
  await response.json();

  equal(response.status, 400);
});

Deno.test("fetch one time token with user authorization", async () => {
  const response = await fetch(`${host}/api/token/oneTime/issue`, {
    method: "GET",
    headers: {
      Authorization: authorization,
    },
  });
  const data = await response.json();

  oneTimeUserToken = data.token;

  equal(response.status, 200);
  equal(typeof data.token, "string");
});

Deno.test("no fetch one time token with missing authorization", async () => {
  const response = await fetch(`${host}/api/token/oneTime/issue`, {
    method: "GET",
  });
  const data = await response.json();

  equal(response.status, 401);
  equal(data.error, "missing token");
});

Deno.test("verify one time token with user authorization", async () => {
  const response = await fetch(`${host}/api/token/oneTime/verify`, {
    ...registerOptions,
    headers: {
      Authorization: authorization,
    },
    body: JSON.stringify({
      token: oneTimeUserToken,
    }),
  });
  const data = await response.json();

  equal(response.status, 200);
  equal(data.verified, true);
});

Deno.test("no verify one time token with missing authorization", async () => {
  const response = await fetch(`${host}/api/token/oneTime/verify`, {
    ...registerOptions,
    body: JSON.stringify({
      token: oneTimeUserToken,
    }),
  });
  const data = await response.json();

  equal(response.status, 401);
  equal(data.error, "missing token");
});

Deno.test("no verify one time token with missing body", async () => {
  const response = await fetch(`${host}/api/token/oneTime/verify`, {
    ...registerOptions,
    headers: {
      Authorization: authorization,
    },
  });
  const data = await response.json();

  equal(response.status, 400);
  equal(data.error, "missing body");
});

Deno.test("no verify one time token with invalid token", async () => {
  const response = await fetch(`${host}/api/token/oneTime/verify`, {
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

Deno.test("can't delete user with missing certain", async () => {
  const response = await fetch(`${host}/api/auth/register/delete`, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
    },
  });
  const data = await response.json();

  equal(response.status, 400);
  equal(data.error, "missing certain");
});

Deno.test("can delete user", async () => {
  const response = await fetch(`${host}/api/auth/register/delete?certain=yes`, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
    },
  });
  const data = await response.json();

  equal(response.status, 200);
  equal(data.deleted, true);
});
