"""ICS date spans: excluded days are actual gaps, not description-only hints."""
from datetime import date, timedelta


def active_segments(event):
    current = date.fromisoformat(event['startDate'])
    end = date.fromisoformat(event['endDate'])
    excluded = set(event.get('excludedDates', []))
    first = None
    spans = []
    while current <= end:
        if current.isoformat() not in excluded:
            if first is None:
                first = current
        elif first is not None:
            spans.append((first.isoformat(), (current - timedelta(days=1)).isoformat()))
            first = None
        current += timedelta(days=1)
    if first is not None:
        spans.append((first.isoformat(), end.isoformat()))
    return spans


def split_calendar_events(events):
    for event in events:
        for index, (start, end) in enumerate(active_segments(event)):
            segment = dict(event, startDate=start, endDate=end)
            if index:
                name, separator, domain = event['uid'].partition('@')
                segment['uid'] = f'{name}-part-{start}{separator}{domain}'
            yield segment
