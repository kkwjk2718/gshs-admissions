import { usePrintOptions } from "../hooks/usePrintOptions";
import { PrintCalendar } from "./PrintCalendar";
import { PrintSchedule } from "./PrintSchedule";
/** Always rendered, never prepared in beforeprint: Ctrl+P and PDF emulation get the same mode. */
export function PrintHost() {
  const { mode } = usePrintOptions();
  return mode === "calendar" ? <PrintCalendar /> : <PrintSchedule />;
}
