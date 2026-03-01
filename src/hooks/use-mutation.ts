"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";

type MutationOptions<TResult> = {
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
};

/**
 * Wraps async mutations with loading, error, and retry state.
 * Shows toast on failure with optional retry.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options?: MutationOptions<TResult>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const lastArgsRef = useRef<TArgs | null>(null);

  const mutate = useCallback(
    async (...args: TArgs) => {
      lastArgsRef.current = args;
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(...args);
        options?.onSuccess?.(result);

        if (options?.successMessage) {
          toast(options.successMessage, { variant: "success" });
        }

        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        options?.onError?.(e);

        toast(options?.errorMessage ?? e.message ?? "Something went wrong", {
          variant: "error",
          action: {
            label: "Retry",
            onClick: () => {
              if (lastArgsRef.current) {
                mutate(...lastArgsRef.current);
              }
            },
          },
        });

        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options, toast],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, reset };
}
