import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) {
      continue;
    }

    process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.ADMIN_SMOKE_EMAIL;
const password = process.env.ADMIN_SMOKE_PASSWORD;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to admin/.env.local before running npm run smoke:integration.`,
    );
  }
}

function collectionCount(payload) {
  const value = payload?.data ?? payload;
  return Array.isArray(value) ? value.length : 0;
}

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} failed: ${response.status} ${text}`);
  }

  return body;
}

async function main() {
  requireEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabaseKey);
  requireEnv("ADMIN_SMOKE_EMAIL", email);
  requireEnv("ADMIN_SMOKE_PASSWORD", password);

  const auth = await requestJson(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const token = auth.access_token;
  if (!token) {
    throw new Error("Supabase auth response did not include an access token");
  }

  const adminHeaders = { Authorization: `Bearer ${token}` };
  const me = await requestJson(`${apiBaseUrl}/v1/me`, { headers: adminHeaders });
  const adminUser = me?.data?.user ?? me;
  if (adminUser?.role !== "admin" || adminUser?.status !== "active") {
    throw new Error(`/v1/me returned non-admin account: ${JSON.stringify(me)}`);
  }

  const [categories, services, providers, payments, tickets] = await Promise.all([
    requestJson(`${apiBaseUrl}/v1/catalog/categories`),
    requestJson(`${apiBaseUrl}/v1/catalog/services`),
    requestJson(`${apiBaseUrl}/v1/catalog/providers`),
    requestJson(`${apiBaseUrl}/v1/admin/payments`, { headers: adminHeaders }),
    requestJson(`${apiBaseUrl}/v1/admin/support/tickets`, { headers: adminHeaders }),
  ]);

  console.log(
    JSON.stringify(
      {
        apiBaseUrl,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          status: adminUser.status,
        },
        counts: {
          categories: collectionCount(categories),
          services: collectionCount(services),
          providers: collectionCount(providers),
          payments: collectionCount(payments),
          supportTickets: collectionCount(tickets),
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
