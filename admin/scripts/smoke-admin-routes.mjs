const baseUrl = process.env.ADMIN_SMOKE_BASE_URL ?? "http://localhost:3001";

const routes = [
  "/login",
  "/dashboard",
  "/transactions",
  "/support",
  "/categories",
  "/services",
  "/service-providers",
  "/reports/revenue",
  "/reports/booking-analytics",
  "/backend-support",
];

async function main() {
  const results = await Promise.all(
    routes.map(async (route) => {
      const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      return { route, status: response.status };
    }),
  );

  const failures = results.filter((result) => result.status >= 500 || result.status === 404);
  console.log(JSON.stringify({ baseUrl, results }, null, 2));

  if (failures.length > 0) {
    throw new Error(
      `Route smoke failed: ${failures
        .map((failure) => `${failure.route} -> ${failure.status}`)
        .join(", ")}`,
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
