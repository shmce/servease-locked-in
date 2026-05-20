import { useEffect, useMemo, useRef } from 'react';

type StableCallback<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => TResult;

export function useStableCallback<TArgs extends unknown[], TResult>(
  callback: StableCallback<TArgs, TResult>,
): StableCallback<TArgs, TResult> {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(
    () =>
      (...args: TArgs) =>
        callbackRef.current(...args),
    [],
  );
}
