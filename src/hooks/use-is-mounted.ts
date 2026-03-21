"use client";

import { useSyncExternalStore } from "react";

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => {
      return () => undefined;
    },
    () => true,
    () => false,
  );
}
