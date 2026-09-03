import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface FilterDialogValue {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const FilterDialogContext = createContext<FilterDialogValue | null>(null);

export function FilterDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openDialog, closeDialog }), [closeDialog, open, openDialog]);

  return <FilterDialogContext.Provider value={value}>{children}</FilterDialogContext.Provider>;
}

export function useFilterDialog() {
  const value = useContext(FilterDialogContext);
  if (!value) throw new Error("useFilterDialog must be used inside FilterDialogProvider");
  return value;
}
