import type { AdmissionCategory, AdmissionEvent } from "../types";

const CATEGORY_NAMES: AdmissionCategory[] = [
  "원서 접수",
  "자소서 입력",
  "추천서 입력",
  "서류 제출",
  "면접",
  "합격 발표",
  "기타",
];

function decodeText(value = "") {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function toDateKey(value = "") {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function previousDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join("-");
}

function cleanDescription(value: string) {
  return decodeText(value)
    .split("\n")
    .map((line) => line.replace(/&#x20;/gi, "").trim())
    .filter(Boolean)
    .filter((line) => !/^자료\s*:/.test(line))
    .filter((line) => !/2027\s*대학입시\s*관련\s*달력\.pdf/i.test(line))
    .filter((line) => !/2027학년도\s*대입수시모집\s*전형일정\.pdf/i.test(line))
    .join("\n");
}

function normalizeCategory(value: string): AdmissionCategory {
  const normalized = decodeText(value).replace(/자기소개서/g, "자소서");
  const direct = CATEGORY_NAMES.find((category) => normalized.includes(category));
  if (direct) return direct;
  if (/원서|지원서/.test(normalized)) return "원서 접수";
  if (/자소서|자기소개/.test(normalized)) return "자소서 입력";
  if (/추천/.test(normalized)) return "추천서 입력";
  if (/면접|구술/.test(normalized)) return "면접";
  if (/서류/.test(normalized)) return "서류 제출";
  if (/합격|발표/.test(normalized)) return "합격 발표";
  return "기타";
}

function parseProperty(line: string) {
  const separator = line.indexOf(":");
  if (separator < 0) return [line.toUpperCase(), ""] as const;
  const key = line.slice(0, separator).split(";", 1)[0].toUpperCase();
  return [key, line.slice(separator + 1)] as const;
}

export function parseAdmissionsIcs(source: string): AdmissionEvent[] {
  const lines = source
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.length > 0)
    .reduce<string[]>((all, line) => {
      if (/^[ \t]/.test(line) && all.length) {
        all[all.length - 1] += line.slice(1);
      } else {
        all.push(line);
      }
      return all;
    }, []);

  const rawEvents: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) rawEvents.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const [key, value] = parseProperty(line);
    current[key] = current[key] ? `${current[key]}\n${value}` : value;
  }

  return rawEvents
    .map((raw, index): AdmissionEvent | null => {
      const summary = decodeText(raw.SUMMARY);
      const startDate = toDateKey(raw.DTSTART);
      const rawEnd = toDateKey(raw.DTEND) || startDate;
      if (!startDate) return null;

      const bracketTags = [...summary.matchAll(/\[([^\]]+)]/g)].map((match) => match[1].trim());
      const explicitCategory = decodeText(raw["X-GSHS-CATEGORY"]);
      const category = normalizeCategory(explicitCategory || bracketTags[0] || summary);
      const dashUniversity = summary.match(/^(.+?)\s*[-–]\s*/)?.[1]?.trim();
      const university =
        decodeText(raw["X-GSHS-UNIVERSITY"]) ||
        bracketTags.find((tag) => normalizeCategory(tag) === "기타") ||
        dashUniversity ||
        "대학 미지정";
      const stripped = summary
        .replace(/^\s*(\[[^\]]+\]\s*){1,3}/, "")
        .replace(new RegExp(`^${university.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-–]\\s*`), "")
        .trim();
      const endDate = rawEnd > startDate ? previousDate(rawEnd) : rawEnd;

      return {
        id: decodeText(raw.UID) || `${university}-${startDate}-${index}`,
        university,
        category,
        title: stripped || category,
        startDate,
        endDate: endDate < startDate ? startDate : endDate,
        description: cleanDescription(raw.DESCRIPTION || ""),
      };
    })
    .filter((event): event is AdmissionEvent => event !== null)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.university.localeCompare(b.university, "ko"));
}

