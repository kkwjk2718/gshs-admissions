import { ArrowUpRight, CalendarDays, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { admissionGuides } from "../data/admissionGuides";
import { CATEGORY_UI } from "../lib/categories";
import { formatDday, formatRange, todayKey, urgencyOf } from "../lib/date";
import { deadlineTimeLabel, eventBadges, hasAmbiguousSchedule, statusLabel, statusOf } from "../lib/eventInfo";
import { CategoryTag, UniversityTag } from "./CategoryTag";
import type { AdmissionEvent, AdmissionGuide } from "../types";

const guides = admissionGuides as Record<string, AdmissionGuide>;

interface EventDetailDialogProps {
  event: AdmissionEvent | null;
  onClose: () => void;
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (event && !dialog.open) dialog.showModal();
    if (!event && dialog.open) dialog.close();
  }, [event]);

  if (!event) return <dialog className="detail-dialog" ref={ref} />;

  const meta = CATEGORY_UI[event.categoryId];
  const guide = guides[event.university];
  const time = deadlineTimeLabel(event);
  const badges = eventBadges(event);
  const today = todayKey();
  const status = statusOf(event, today);
  const statusText = statusLabel(event, today);

  return (
    <dialog
      className="detail-dialog"
      ref={ref}
      onClose={onClose}
      onClick={(clickEvent) => {
        if (clickEvent.target === ref.current) onClose();
      }}
      aria-labelledby="detail-dialog-title"
    >
      <div className="detail-dialog__body">
        <button type="button" className="icon-button detail-dialog__close" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>

        <div className="detail-dialog__tags">
          <UniversityTag name={event.university} />
          <CategoryTag id={event.categoryId} />
        </div>

        <h2 id="detail-dialog-title">{event.admissionDetail}</h2>

        <div className="detail-dialog__when">
          <CalendarDays size={18} aria-hidden="true" />
          <span className="detail-dialog__range">{formatRange(event.startDate, event.deadlineDate)}</span>
          {time && <strong className="detail-dialog__time">{time}</strong>}
          <span className={`dday dday--${urgencyOf(event.deadlineDate, today)}`}>
            {formatDday(event.deadlineDate, meta.noun, today)}
          </span>
        </div>

        {(statusText || badges.length > 0) && (
          <div className="detail-dialog__badges">
            {statusText && <span className={`status status--${status}`}>{statusText}</span>}
            {badges.map((badge) => (
              <span className="badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        )}

        <dl className="detail-dialog__facts">
          <div>
            <dt>원문 표기</dt>
            <dd>{event.rawSchedule}</dd>
          </div>
        </dl>

        {hasAmbiguousSchedule(event) && (
          <p className="detail-dialog__warning">
            <TriangleAlert size={16} aria-hidden="true" />
            원문에 다른 날짜도 있습니다. 위 원문 표기를 확인하세요.
          </p>
        )}

        <div className="detail-dialog__actions">
          {guide && (
            <a className="button button--primary" href={guide.url} target="_blank" rel="noreferrer">
              {event.university} 모집요강 열기
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          <Link className="button" to={`/schedule?u=${encodeURIComponent(event.university)}`} onClick={onClose}>
            {event.university} 전형일정 보기
          </Link>
        </div>

        {guide && <p className="detail-dialog__verified">요강 링크 확인 {guide.verifiedAt}</p>}
      </div>
    </dialog>
  );
}
