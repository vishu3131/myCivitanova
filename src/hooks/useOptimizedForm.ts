"use client";

import { useCallback, useState } from 'react';
import { useLoading } from '@/context/LoadingContext';

interface UseOptimizedFormOptions {
  loadingMessage?: string;
  preventMultipleSubmits?: boolean;
  cooldownMs?: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useOptimizedForm(options: UseOptimizedFormOptions = {}) {
  const {
    loadingMessage = 'Invio in corso...',
    preventMultipleSubmits = true,
    cooldownMs = 2000,
    onSuccess,
    onError,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = useCallback(
    (submitFunction: () => Promise<any>) => {
      return async (event: React.FormEvent) => {
        event.preventDefault();

        if (isSubmitting && preventMultipleSubmits) {
          return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        startLoading(loadingMessage);

        try {
          const result = await submitFunction();
          onSuccess?.();
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'invio';
          setSubmitError(errorMessage);
          onError?.(error);
          throw error;
        } finally {
          setTimeout(() => {
            setIsSubmitting(false);
            stopLoading();
          }, cooldownMs);
        }
      };
    },
    [isSubmitting, preventMultipleSubmits, startLoading, stopLoading, loadingMessage, cooldownMs, onSuccess, onError]
  );

  const resetForm = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
    stopLoading();
  }, [stopLoading]);

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    resetForm,
  };
}