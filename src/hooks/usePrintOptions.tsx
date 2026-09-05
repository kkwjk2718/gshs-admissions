import { createContext, useContext, useState, type ReactNode } from "react";
export type PrintMode = "schedule" | "calendar";
const Context = createContext<{ mode: PrintMode; setMode: (mode: PrintMode) => void; open: boolean; setOpen: (open: boolean) => void } | null>(null);
export function PrintOptionsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PrintMode>("schedule");
  const [open, setOpen] = useState(false);
  return <Context.Provider value={{ mode, setMode, open, setOpen }}>{children}</Context.Provider>;
}
export function usePrintOptions() {
  const value = useContext(Context);
  if (!value) throw new Error("usePrintOptions requires PrintOptionsProvider");
  return value;
}
