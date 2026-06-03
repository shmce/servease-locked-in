export const providerServiceStartWindowMinutes = 30;
export const providerServiceStartWindowMs =
  providerServiceStartWindowMinutes * 60 * 1000;

export function isProviderServiceStartWindowOpen(
  scheduledAtValue: string | null | undefined,
  now = new Date(),
): boolean {
  if (!scheduledAtValue) {
    return false;
  }

  const scheduledAt = new Date(scheduledAtValue).getTime();
  const nowTime = now.getTime();

  return (
    Number.isFinite(scheduledAt) &&
    Number.isFinite(nowTime) &&
    nowTime >= scheduledAt - providerServiceStartWindowMs
  );
}
