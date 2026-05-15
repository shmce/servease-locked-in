import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  if (!existsSync(path)) return {};

  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return env;
      }
      const [key, ...valueParts] = trimmed.split("=");
      env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
      return env;
    }, {});
}

const localEnv = {
  ...loadEnv(resolve(root, ".env")),
  ...loadEnv(resolve(root, ".env.local")),
  ...process.env,
};

const required = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

const missing = required.filter((key) => !localEnv[key]);

if (missing.length > 0) {
  console.error(`Missing admin env keys: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Admin env keys present.");
  console.log(`Gateway: ${localEnv.NEXT_PUBLIC_API_BASE_URL}`);
  console.log(`Supabase URL configured: ${Boolean(localEnv.NEXT_PUBLIC_SUPABASE_URL)}`);
}
