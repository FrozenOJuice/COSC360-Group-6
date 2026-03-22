import { useEffect, useState } from "react";

export function useDebouncedQueryInput({
  queryValue,
  onCommit,
  delay = 250,
  normalize = (value) => value.trim(),
}) {
  const [inputValue, setInputValue] = useState(queryValue);

  const normalizedInputValue = normalize(inputValue);
  const isPending = normalizedInputValue !== queryValue;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (normalizedInputValue === queryValue) {
        return;
      }

      onCommit(normalizedInputValue);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, normalizedInputValue, onCommit, queryValue]);

  return {
    inputValue,
    setInputValue,
    isPending,
  };
}
