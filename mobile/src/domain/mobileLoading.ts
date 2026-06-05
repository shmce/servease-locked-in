export type MobileContentLoadState =
  | 'initial'
  | 'refreshing'
  | 'resolved-empty'
  | 'ready';

export type MobileSelectedEntityState = 'loading' | 'missing' | 'ready';

export function resolveMobileContentLoadState(input: {
  hasContent: boolean;
  isLoading: boolean;
}): MobileContentLoadState {
  if (input.isLoading && !input.hasContent) {
    return 'initial';
  }

  if (input.isLoading && input.hasContent) {
    return 'refreshing';
  }

  if (!input.hasContent) {
    return 'resolved-empty';
  }

  return 'ready';
}

export function resolveSelectedEntityState<T>(input: {
  entity: T | null | undefined;
  hasLoaded: boolean;
  selectedId: string | null | undefined;
}): MobileSelectedEntityState {
  if (input.entity) {
    return 'ready';
  }

  if (input.selectedId && !input.hasLoaded) {
    return 'loading';
  }

  return 'missing';
}

export function shouldShowGlobalBusyPill(_busyAction: string | null): boolean {
  return false;
}
