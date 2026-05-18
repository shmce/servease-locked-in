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

export function pickQueryItem<TItem extends { id: string | number }>(
  search: string,
  key: string,
  items: TItem[],
): TItem | null {
  const requestedId = new URLSearchParams(search).get(key)

  if (!requestedId) {
    return null
  }

  return items.find((item) => String(item.id) === requestedId) ?? null
}

export function pickQueryItemStatus<TStatus extends string>(
  search: string,
  key: string,
  items: Array<{ id: string | number; status: TStatus }>,
  fallback: TStatus,
): TStatus {
  return pickQueryItem(search, key, items)?.status ?? fallback
}
