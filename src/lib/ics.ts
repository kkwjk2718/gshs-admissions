import { CATEGORY_UI } from "./categories";
import type { AdmissionEvent } from "../types";

/**
 * 고른 대학의 일정만 담은 .ics 파일을 브라우저에서 만든다.
 * 이 앱을 매일 열지 않아도 폰 기본 캘린더가 마감을 알려주게 하는 것이 목적이다.
 */

const CRLF = "\r\n";

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * RFC 5545는 75옥텟에서 접으라고 한다. 한글은 UTF-8에서 3바이트라 글자 수로 세면 안 되고,
 * `\,` 같은 이스케이프 쌍은 두 글자 사이에서 잘리면 안 되므로 한 덩어리로 센다.
 */
function foldLine(line: string) {
  const encoder = new TextEncoder();
  const chars = [...line];
  const chunks: string[] = [];
  for (let index = 0; index < chars.length; index += 1) {
    if (chars[index] === "\\" && index + 1 < chars.length) {
      chunks.push(chars[index] + chars[index + 1]);
      index += 1;
    } else {
      chunks.push(chars[index]);
    }
  }

  const lines: string[] = [];
  let current = "";
  let bytes = 0;

  for (const char of chunks) {
    const size = encoder.encode(char).length;
    const limit = lines.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      lines.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);

  return lines.map((part, index) => (index === 0 ? part : ` ${part}`)).join(CRLF);
}

function toIcsDate(key: string) {
  return key.replace(/-/g, "");
}

function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toIcsUtc(date: Date) {
  return `${date.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

/** 한국 시각 기준으로 알림 시각을 만든다. */
function alarmTrigger(dateKey: string, kstTime: string) {
  return toIcsUtc(new Date(`${dateKey}T${kstTime}:00+09:00`));
}

function buildAlarms(event: AdmissionEvent) {
  const noun = CATEGORY_UI[event.categoryId].noun;
  const time = event.timeLabels[0];
  const stamps = [
    { at: alarmTrigger(shiftDay(event.deadlineDate, -3), "09:00"), text: `3일 뒤 ${noun}` },
    { at: alarmTrigger(shiftDay(event.deadlineDate, -1), "09:00"), text: `내일 ${noun}` },
    { at: alarmTrigger(event.deadlineDate, "08:00"), text: time ? `오늘 ${time} ${noun}` : `오늘 ${noun}` },
  ];

  return stamps.flatMap(({ at, text }) => [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `TRIGGER;VALUE=DATE-TIME:${at}`,
    foldLine(`DESCRIPTION:${escapeText(`${event.university} ${CATEGORY_UI[event.categoryId].label} — ${text}`)}`),
    "END:VALARM",
  ]);
}

function buildEvent(event: AdmissionEvent, stamp: string) {
  const meta = CATEGORY_UI[event.categoryId];
  const time = event.timeLabels[0];
  const summary = [event.university, meta.label, time ? `${time} ${meta.noun}` : meta.noun].join(" ");
  const description = [
    `전형: ${event.admissionDetail}`,
    `원문 표기: ${event.rawSchedule}`,
    event.excludedDates.length ? `제외: ${event.excludedDates.join(", ")}` : "",
    "일정이 바뀔 수 있어요. 지원 전 각 대학 입학처에서 다시 확인하세요.",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${toIcsDate(shiftDay(event.deadlineDate, 1))}`,
    foldLine(`SUMMARY:${escapeText(summary)}`),
    foldLine(`DESCRIPTION:${escapeText(description)}`),
    foldLine(`CATEGORIES:${escapeText(`${meta.label},${event.university}`)}`),
    "TRANSP:TRANSPARENT",
    ...buildAlarms(event),
    "END:VEVENT",
  ];
}

export function buildIcsFile(events: AdmissionEvent[], calendarName = "2027 수시 일정") {
  const stamp = toIcsUtc(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//GSHS.app//2027 수시 일정//KO",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeText(calendarName)}`),
    "X-WR-TIMEZONE:Asia/Seoul",
    ...events.flatMap((event) => buildEvent(event, stamp)),
    "END:VCALENDAR",
  ];

  return `${lines.join(CRLF)}${CRLF}`;
}

export function downloadIcs(events: AdmissionEvent[], fileName = "2027-수시-일정.ics") {
  const blob = new Blob([buildIcsFile(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** 전체 일정을 구독으로 받는 주소. 폰 캘린더 앱이 알아서 갱신한다. */
export function subscriptionUrl() {
  if (typeof window === "undefined") return "";
  return `webcal://${window.location.host}/data/admissions.ics`;
}
