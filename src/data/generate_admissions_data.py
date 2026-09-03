from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import pdfplumber


PROJECT_ROOT = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = PROJECT_ROOT.parent
PUBLIC_DATA_DIR = PROJECT_ROOT / "public" / "data"

CATEGORY_DEFINITIONS = [
    {
        "id": "application",
        "label": "원서 접수",
        "sourceLabel": "지원서 접수",
        "shortLabel": "원서",
    },
    {
        "id": "essay",
        "label": "자소서 입력",
        "sourceLabel": "자소서 입력",
        "shortLabel": "자소서",
    },
    {
        "id": "recommendation",
        "label": "추천서 입력",
        "sourceLabel": "추천서 입력",
        "shortLabel": "추천서",
    },
    {
        "id": "documents",
        "label": "서류 제출",
        "sourceLabel": "서류 제출",
        "shortLabel": "서류",
    },
    {
        "id": "first-result",
        "label": "1차 발표",
        "sourceLabel": "1차 발표",
        "shortLabel": "1차",
    },
    {
        "id": "interview",
        "label": "면접",
        "sourceLabel": "면접 및 구술",
        "shortLabel": "면접",
    },
    {
        "id": "final-result",
        "label": "합격자 발표",
        "sourceLabel": "합격자 발표",
        "shortLabel": "합격",
    },
    {
        "id": "additional-result",
        "label": "충원 합격자 발표",
        "sourceLabel": "충원 합격자 발표",
        "shortLabel": "충원",
    },
]

CATEGORY_BY_SOURCE = {
    item["sourceLabel"]: item for item in CATEGORY_DEFINITIONS
}

UNIVERSITY_IDS = {
    "서울대": "snu",
    "KAIST": "kaist",
    "POSTECH": "postech",
    "GIST": "gist",
    "UNIST": "unist",
    "DGIST": "dgist",
    "KENTECH": "kentech",
    "연세대": "yonsei",
    "고려대": "korea",
    "성균관대": "sungkyunkwan",
    "한양대": "hanyang",
    "서강대": "sogang",
    "이화여대": "ewha",
    "중앙대": "chung-ang",
    "경희대": "kyung-hee",
    "서울시립대": "uos",
    "건국대": "konkuk",
    "동국대": "dongguk",
    "서울과기대": "seoultech",
    "국민대": "kookmin",
    "세종대": "sejong",
    "아주대": "ajou",
    "부산대": "pusan",
    "경북대": "kyungpook",
}

TABLE_COLUMN_KEYS = {
    "대학": "university",
    "입학전형": "admissionType",
    "지원서접수": "application",
    "자소서입력": "essay",
    "추천서입력": "recommendation",
    "서류제출": "documents",
    "1차발표": "firstResult",
    "면접및구술": "interview",
    "합격자발표": "finalResult",
    "충원합격자발표": "additionalResult",
}

TABLE_COLUMN_LABELS = {
    "university": "대학",
    "admissionType": "입학전형",
    "application": "지원서 접수",
    "essay": "자소서 입력",
    "recommendation": "추천서 입력",
    "documents": "서류 제출",
    "firstResult": "1차 발표",
    "interview": "면접 및 구술",
    "finalResult": "합격자 발표",
    "additionalResult": "충원 합격자 발표",
}


def find_source_files() -> tuple[Path, Path]:
    calendar_path = next(WORKSPACE_ROOT.glob("*.ics"))
    pdf_candidates = list(WORKSPACE_ROOT.glob("*.pdf"))
    detailed_pdf = next(
        path for path in pdf_candidates if len(pdfplumber.open(path).pages) == 2
    )
    return calendar_path, detailed_pdf


def unfold_ics(raw: str) -> list[str]:
    normalized = raw.replace("\r\r\n", "\n").replace("\r\n", "\n").replace("\r", "\n")
    lines: list[str] = []
    for line in normalized.split("\n"):
        if not line:
            continue
        if line.startswith((" ", "\t")) and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines


def unescape_ics(value: str) -> str:
    result: list[str] = []
    index = 0
    while index < len(value):
        if value[index] != "\\" or index + 1 >= len(value):
            result.append(value[index])
            index += 1
            continue
        escaped = value[index + 1]
        if escaped in ("n", "N"):
            result.append("\n")
        else:
            result.append(escaped)
        index += 2
    return "".join(result)


def parse_ics_events(calendar_path: Path) -> list[dict[str, Any]]:
    lines = unfold_ics(calendar_path.read_text(encoding="utf-8-sig"))
    raw_events: list[dict[str, str]] = []
    current: dict[str, str] | None = None
    for line in lines:
        if line == "BEGIN:VEVENT":
            current = {}
        elif line == "END:VEVENT":
            if current is not None:
                raw_events.append(current)
            current = None
        elif current is not None and ":" in line:
            key, value = line.split(":", 1)
            current[key.split(";", 1)[0]] = value

    events: list[dict[str, Any]] = []
    for raw_event in raw_events:
        detail_lines = unescape_ics(raw_event["DESCRIPTION"]).splitlines()
        details = {
            key: value
            for line in detail_lines
            if ": " in line
            for key, value in [line.split(": ", 1)]
        }
        university = details["대학"]
        source_category = details["구분"]
        category = CATEGORY_BY_SOURCE[source_category]
        start = datetime.strptime(raw_event["DTSTART"], "%Y%m%d").date()
        end_exclusive = datetime.strptime(raw_event["DTEND"], "%Y%m%d").date()
        end = end_exclusive - timedelta(days=1)
        raw_schedule = details["원문 일정"]
        time_labels = list(dict.fromkeys(re.findall(r"(?<!\d)(\d{1,2}:\d{2})", raw_schedule)))
        excluded_dates = parse_excluded_dates(raw_schedule, start.year)
        note = details.get(
            "안내",
            "참고용 자료이며 일정이 바뀔 수 있으므로 해당 대학 홈페이지에서 최종 확인하세요.",
        )
        description = "\n".join(
            [
                f"대학: {university}",
                f"전형: {details['전형']}",
                f"구분: {category['label']}",
                f"원문 일정: {raw_schedule}",
                f"안내: {note}",
            ]
        )
        events.append(
            {
                "id": raw_event["UID"].split("@", 1)[0],
                "uid": raw_event["UID"],
                "universityId": UNIVERSITY_IDS[university],
                "university": university,
                "categoryId": category["id"],
                "category": category["label"],
                "sourceCategory": source_category,
                "title": f"{university} {category['label']}",
                "taggedTitle": f"[{category['label']}] [{university}]",
                "admissionDetail": details["전형"],
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "deadlineDate": end.isoformat(),
                "isDateRange": start != end,
                "timeLabels": time_labels,
                "excludedDates": excluded_dates,
                "rawSchedule": raw_schedule,
                "description": description,
                "note": note,
            }
        )

    events.sort(
        key=lambda event: (
            event["startDate"],
            event["deadlineDate"],
            event["university"],
            event["categoryId"],
            event["id"],
        )
    )
    return events


def parse_excluded_dates(raw_schedule: str, default_year: int) -> list[str]:
    excluded: list[date] = []
    for match in re.finditer(
        r"(?:(20\d{2})\.)?(\d{1,2})\.(\d{1,2})\.?\s*\([^)]*\)\s*제외",
        raw_schedule,
    ):
        excluded.append(
            date(int(match.group(1) or default_year), int(match.group(2)), int(match.group(3)))
        )
    for match in re.finditer(r"(\d{1,2})\.(\d{1,2})\s*~\s*(\d{1,2})\s*제외", raw_schedule):
        month = int(match.group(1))
        first_day = int(match.group(2))
        last_day = int(match.group(3))
        excluded.extend(date(default_year, month, day) for day in range(first_day, last_day + 1))
    return sorted({item.isoformat() for item in excluded})


def clean_cell(value: str | None) -> str | None:
    if value is None:
        return None
    return "\n".join(line.strip() for line in value.splitlines()).strip()


def extract_table(detailed_pdf: Path) -> dict[str, Any]:
    pages: list[dict[str, Any]] = []
    total_rows = 0
    university_order: list[str] = []

    with pdfplumber.open(detailed_pdf) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            table = page.extract_table(
                {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "intersection_tolerance": 5,
                }
            )
            if not table or len(table) < 3:
                raise RuntimeError(f"{page_number}페이지에서 표를 추출하지 못했습니다.")

            source_headers = [clean_cell(cell) or "" for cell in table[1]]
            column_keys = [TABLE_COLUMN_KEYS[header.replace(" ", "")] for header in source_headers]
            raw_rows = [[clean_cell(cell) for cell in row] for row in table[2:]]
            total_rows += len(raw_rows)

            active_university = ""
            rows: list[dict[str, Any]] = []
            for row_index, raw_row in enumerate(raw_rows):
                university_value = raw_row[0]
                if university_value is not None and university_value != "":
                    active_university = university_value
                    if active_university not in university_order:
                        university_order.append(active_university)

                cells: dict[str, dict[str, Any] | None] = {}
                for column_index, column_key in enumerate(column_keys):
                    value = raw_row[column_index]
                    if value is None:
                        cells[column_key] = None
                        continue
                    row_span = 1
                    next_row_index = row_index + 1
                    while next_row_index < len(raw_rows):
                        next_value = raw_rows[next_row_index][column_index]
                        if next_value is not None:
                            break
                        row_span += 1
                        next_row_index += 1
                    cells[column_key] = {"text": value, "rowSpan": row_span}

                rows.append(
                    {
                        "id": f"page-{page_number}-row-{row_index + 1}",
                        "universityId": UNIVERSITY_IDS[active_university],
                        "university": active_university,
                        "cells": cells,
                    }
                )

            pages.append(
                {
                    "page": page_number,
                    "columnKeys": column_keys,
                    "columns": [
                        {"key": key, "label": TABLE_COLUMN_LABELS[key]} for key in column_keys
                    ],
                    "rows": rows,
                }
            )

    return {
        "title": "2027년 대입수시모집 전형일정",
        "notice": "일자 변경으로 차이가 있을 수 있으니 반드시 대학 홈페이지에서 확인하시기 바랍니다. 참고용으로만 활용해 주세요.",
        "rowCount": total_rows,
        "universityOrder": university_order,
        "pages": pages,
    }


def escape_ics(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("\n", "\\n")
        .replace(";", "\\;")
        .replace(",", "\\,")
    )


def fold_ics_line(line: str, limit: int = 73) -> list[str]:
    pieces: list[str] = []
    current = ""
    current_bytes = 0
    for character in line:
        character_bytes = len(character.encode("utf-8"))
        if current and current_bytes + character_bytes > limit:
            pieces.append(current)
            current = " " + character
            current_bytes = 1 + character_bytes
        else:
            current += character
            current_bytes += character_bytes
    if current:
        pieces.append(current)
    return pieces


def build_ics(events: list[dict[str, Any]]) -> bytes:
    lines = [
        "BEGIN:VCALENDAR",
        "PRODID:-//GSHS//Admissions Schedule 2027//KO",
        "VERSION:2.0",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:" + escape_ics("입시_일정"),
        "X-WR-TIMEZONE:Asia/Seoul",
    ]
    for event in events:
        start = date.fromisoformat(event["startDate"])
        end = date.fromisoformat(event["endDate"])
        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{event['uid']}",
                "DTSTAMP:20260903T000000Z",
                f"DTSTART;VALUE=DATE:{start.strftime('%Y%m%d')}",
                f"DTEND;VALUE=DATE:{(end + timedelta(days=1)).strftime('%Y%m%d')}",
                "SUMMARY:" + escape_ics(event["taggedTitle"]),
                "DESCRIPTION:" + escape_ics(event["description"]),
                "CATEGORIES:"
                + escape_ics(event["category"])
                + ","
                + escape_ics(event["university"]),
                "X-GSHS-UNIVERSITY:" + escape_ics(event["university"]),
                "X-GSHS-CATEGORY:" + escape_ics(event["category"]),
                "X-GSHS-UNIVERSITY-ID:" + event["universityId"],
                "X-GSHS-CATEGORY-ID:" + event["categoryId"],
                "TRANSP:TRANSPARENT",
                "END:VEVENT",
            ]
        )
    lines.append("END:VCALENDAR")
    physical_lines = [piece for line in lines for piece in fold_ics_line(line)]
    return ("\r\n".join(physical_lines) + "\r\n").encode("utf-8")


def main() -> None:
    calendar_path, detailed_pdf = find_source_files()
    events = parse_ics_events(calendar_path)
    table = extract_table(detailed_pdf)

    university_counts = Counter(event["university"] for event in events)
    category_counts = Counter(event["categoryId"] for event in events)
    universities = [
        {
            "id": UNIVERSITY_IDS[name],
            "name": name,
            "tag": name,
            "eventCount": university_counts[name],
        }
        for name in table["universityOrder"]
    ]
    categories = [
        {**definition, "eventCount": category_counts[definition["id"]]}
        for definition in CATEGORY_DEFINITIONS
    ]

    payload = {
        "meta": {
            "academicYear": 2027,
            "calendarYear": 2026,
            "calendarName": "입시_일정",
            "timezone": "Asia/Seoul",
            "eventCount": len(events),
            "universityCount": len(universities),
            "tableRowCount": table["rowCount"],
            "dateRange": {
                "start": min(event["startDate"] for event in events),
                "end": max(event["endDate"] for event in events),
            },
            "notice": table["notice"],
        },
        "categories": categories,
        "universities": universities,
        "events": events,
        "admissionsTable": table,
    }

    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    (PUBLIC_DATA_DIR / "admissions.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    (PUBLIC_DATA_DIR / "admissions.ics").write_bytes(build_ics(events))

    print(
        json.dumps(
            {
                "events": len(events),
                "universities": len(universities),
                "tableRows": table["rowCount"],
                "dateRange": payload["meta"]["dateRange"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
