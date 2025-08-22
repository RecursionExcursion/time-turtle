"use client";

import { useState } from "react";

export function useIsProcessing() {
  const [isWorking, setIsWorking] = useState(false);

  async function work(fn: () => Promise<void>) {
    if (isWorking) return;
    setIsWorking(true);
    await fn();
    setIsWorking(false);
  }

  return {
    isWorking,
    work,
  };
}
