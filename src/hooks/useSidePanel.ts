import { useCallback, useState } from "react";

const STORAGE_KEY = "gshs-admissions:side-panel";

/** 오른쪽 패널을 접어두면 다음에 열 때도 접힌 채로 시작한다. */
export function useSidePanel() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "closed";
    } catch {
      return true;
    }
  });

  const toggle = useCallback(() => {
    setOpen((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
      } catch {
        // 저장에 실패해도 이번 세션에서는 그대로 동작한다.
      }
      return next;
    });
  }, []);

  return { open, toggle };
}
