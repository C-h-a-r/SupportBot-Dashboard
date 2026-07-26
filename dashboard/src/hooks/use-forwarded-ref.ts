import { useEffect, useRef, type ForwardedRef } from "react";

export function useForwardedRef<T>(forwardedRef: ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") {
      forwardedRef(innerRef.current);
    } else {
      forwardedRef.current = innerRef.current;
    }
  });

  return innerRef;
}
