// src/hooks/useAsyncAction.ts
import { useCallback, useState } from "react";
import { ApiError } from "@/lib/http";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: "idle" | "loading" | "success" | "error";
}

export function useAsyncAction<TPayload, TResult>(
  action: (payload: TPayload) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    loading: false,
    error: null,
    status: "idle",
  });

  const run = useCallback(
    async (payload: TPayload) => {
      setState({ data: null, loading: true, error: null, status: "loading" });

      try {
        const data = await action(payload);
        setState({ data, loading: false, error: null, status: "success" });
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Error inesperado en la llamada al backend";

        setState({ data: null, loading: false, error: errorMessage, status: "error" });
        throw err;
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, status: "idle" });
  }, []);

  return { ...state, run, reset };
}