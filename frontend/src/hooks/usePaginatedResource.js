import { useCallback, useEffect, useRef, useState } from "react";

export function usePaginatedResource({
  initialQuery,
  initialResult,
  loadResource,
  normalizeResult,
  fallbackMessage,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [resolvedRequestKey, setResolvedRequestKey] = useState("");
  const requestIdRef = useRef(0);

  const requestKey = `${reloadVersion}:${JSON.stringify(query)}`;
  const loading = resolvedRequestKey !== requestKey;

  useEffect(() => {
    let isActive = true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function syncResource() {
      try {
        const response = await loadResource(query);

        if (!isActive || requestIdRef.current !== requestId) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || fallbackMessage);
          setResolvedRequestKey(requestKey);
          return;
        }

        const nextResult = normalizeResult(response.data);
        const nextPagination = nextResult.pagination ?? initialResult.pagination;

        if (nextPagination.totalPages > 0 && query.page > nextPagination.totalPages) {
          setQuery((current) => (
            current.page === query.page
              ? { ...current, page: nextPagination.totalPages }
              : current
          ));
          return;
        }

        setResult(nextResult);
        setError("");
        setResolvedRequestKey(requestKey);
      } catch {
        if (!isActive || requestIdRef.current !== requestId) {
          return;
        }

        setError("Could not connect to the server.");
        setResolvedRequestKey(requestKey);
      }
    }

    void syncResource();

    return () => {
      isActive = false;
    };
  }, [
    fallbackMessage,
    initialResult.pagination,
    loadResource,
    normalizeResult,
    query,
    requestKey,
  ]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const setErrorMessage = useCallback((message) => {
    setError(message);
  }, []);

  const updateQuery = useCallback((patch) => {
    setError("");
    setQuery((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const replaceQuery = useCallback((nextQuery) => {
    setError("");
    setQuery(nextQuery);
  }, []);

  const reload = useCallback(() => {
    setError("");
    setReloadVersion((current) => current + 1);
  }, []);

  return {
    query,
    result,
    loading,
    error,
    clearError,
    setErrorMessage,
    updateQuery,
    replaceQuery,
    reload,
  };
}
