import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { useAdmissions } from "../hooks/useAdmissions";
import { useCalendarMonth } from "../hooks/useCalendarMonth";
import { usePreferences } from "../hooks/usePreferences";
import { usePrintOptions } from "../hooks/usePrintOptions";
import { CATEGORY_UI } from "../lib/categories";
import { PRINT_SCOPE } from "./PrintSchedule";

export function PrintChooser() {
  const { mode, setMode, open, setOpen } = usePrintOptions();
  const { month, monthSource } = useCalendarMonth();
  const { universities, categories } = usePreferences();
  const { status } = useAdmissions();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  const close = () => setOpen(false);
  return <dialog id="print-chooser" className="print-chooser" ref={ref} aria-labelledby="print-chooser-title" aria-describedby="print-chooser-scope" onCancel={close} onClose={close}>
    <h2 id="print-chooser-title">인쇄 형식 선택</h2>
    <p id="print-chooser-scope">선택 대학 {universities.length}곳만 인쇄합니다. {universities.join(" / ")}</p>
    <fieldset><legend>인쇄할 내용</legend>
      <label className="print-choice"><input autoFocus type="radio" name="print-mode" value="schedule" checked={mode === "schedule"} onChange={() => setMode("schedule")} /><span><strong>대학별 전체 일정</strong><small>{PRINT_SCOPE}</small></span></label>
      <label className="print-choice"><input type="radio" name="print-mode" value="calendar" checked={mode === "calendar"} onChange={() => setMode("calendar")} /><span><strong>월간 달력 · {format(month, "yyyy년 M월")}</strong><small>{monthSource}. 선택한 일정 종류만 포함합니다. 한 달을 A4 가로 한 장에 요약합니다. 상세 페이지는 붙지 않습니다.</small></span></label>
    </fieldset>
    <p className="print-chooser__hint">달력 일정 종류: {categories.map(id => CATEGORY_UI[id].label).join(" / ") || "선택 없음"}. 대학 검색어는 대학 선택창 검색에만 적용됩니다.</p>
    <p className="print-chooser__hint">Ctrl+P / 브라우저 인쇄도 지금 선택한 형식을 사용합니다. 처음에는 대학별 전체 일정입니다.</p>
    <footer><button className="button" type="button" data-print-cancel onClick={close}>닫기</button><button className="button button--primary" type="button" data-print-confirm disabled={!universities.length || status !== "ready"} onClick={() => {
      // Close the native top-layer dialog before print; document is already rendered for this mode.
      ref.current?.close();
      setOpen(false);
      requestAnimationFrame(() => window.print());
    }}>인쇄하기</button></footer>
  </dialog>;
}
