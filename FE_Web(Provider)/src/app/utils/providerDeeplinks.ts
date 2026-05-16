export function pickQueryItemId(
  search: string,
  key: string,
  availableIds: Array<string | number>,
  fallback: string | number | null = null,
): string | number | null {
  const requestedId = new URLSearchParams(search).get(key)

  if (!requestedId) {
    return fallback
  }

  const match = availableIds.find((id) => String(id) === requestedId)
  return match ?? fallback
}
