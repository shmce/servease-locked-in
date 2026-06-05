const pendingNetworkActions = new Set<string>();

export async function runExclusiveNetworkAction<T>(
  key: string,
  action: () => Promise<T>,
  options: {
    onDuplicate?: () => T | Promise<T>;
  } = {},
): Promise<T> {
  if (pendingNetworkActions.has(key)) {
    if (options.onDuplicate) {
      return options.onDuplicate();
    }
    throw new Error('Action already in progress.');
  }

  pendingNetworkActions.add(key);
  try {
    return await action();
  } finally {
    pendingNetworkActions.delete(key);
  }
}

export function isNetworkActionPending(key: string): boolean {
  return pendingNetworkActions.has(key);
}

export function clearNetworkActionGuards(): void {
  pendingNetworkActions.clear();
}
