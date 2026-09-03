import { ArrowUpRight, CalendarDays, X } from "lucide-react";
import { useEffect } from "react";
import { formatEventRange } from "../lib/date";
import type { AdmissionEvent, AdmissionGuide } from "../types";
import { CategoryTag } from "./CategoryTag";

interface EventDialogProps {
  event: AdmissionEvent | null;
  guide?: AdmissionGuide;
  onClose: () => void;
}

export function EventDialog({ event, guide, onClose }: EventDialogProps) {
  useEffect(() => {
    if (!event) return;
    const handleKeydown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeydown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.classList.remove("modal-open");
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="event-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-title"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <button className="icon-button event-dialog__close" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
        <div className="event-dialog__tags">
          <span className="university-tag">{event.university}</span>
          <CategoryTag category={event.category} />
        </div>
        <h2 id="event-title">{event.title}</h2>
        <div className="event-dialog__date">
          <CalendarDays size={17} />
          {formatEventRange(event.startDate, event.endDate)}
        </div>
        {event.description && <p className="event-dialog__description">{event.description}</p>}
        {guide && (
          <a className="guide-link" href={guide.url} target="_blank" rel="noreferrer">
            {guide.label} <ArrowUpRight size={15} />
          </a>
        )}
      </section>
    </div>
  );
}

