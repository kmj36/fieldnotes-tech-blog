import {useEffect, useReducer} from 'react';

/* ═══════════════════════════════════════════════════════════════
   UTILITY HOOK
═══════════════════════════════════════════════════════════════ */
interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }

// useReducer 패턴: dispatch는 set-state-in-effect 규칙 적용 대상이 아님
type AsyncAction<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; error: string };

function asyncReducer<T>(
  _state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> {
  switch (action.type) {
    case "LOADING": return { data: null, loading: true, error: null };
    case "SUCCESS": return { data: action.payload, loading: false, error: null };
    case "ERROR": return { data: null, loading: false, error: action.error };
  }
}

export default function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, dispatch] = useReducer(
    asyncReducer as (s: AsyncState<T>, a: AsyncAction<T>) => AsyncState<T>,
    { data: null, loading: true, error: null }
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    fn()
      .then(payload => { if (!cancelled) dispatch({ type: "SUCCESS", payload }); })
      .catch((e: unknown) => {
        if (!cancelled) dispatch({ type: "ERROR", error: (e as Error).message });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}