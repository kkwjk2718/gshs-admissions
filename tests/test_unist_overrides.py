import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("generator", ROOT / "src/data/generate_admissions_data.py")
assert spec is not None and spec.loader is not None
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class UnistOverridesTest(unittest.TestCase):
    def setUp(self):
        self.before = json.loads(subprocess.check_output(
            ["git", "show", "adfb92a:public/data/admissions.json"], cwd=ROOT))
        self.data = copy.deepcopy(self.before)
        generator.apply_unist_2027_overrides(self.data)

    def test_idempotent_and_published(self):
        once = copy.deepcopy(self.data)
        generator.apply_unist_2027_overrides(self.data)
        self.assertEqual(once, self.data)
        # This test isolates the historical UNIST-only layer, before the full audit.
        baseline = json.loads(subprocess.check_output(["git", "show", "de10294:public/data/admissions.json"], cwd=ROOT))
        self.assertEqual(self.data, baseline)

    def test_only_three_existing_events_change(self):
        old = {e["id"]: e for e in self.before["events"]}
        changed = [e for e in self.data["events"] if e["id"] in old and e != old[e["id"]]]
        self.assertEqual({e["categoryId"] for e in changed}, {"application", "essay", "documents"})
        self.assertEqual(len(changed), 3)
        for event in changed:
            self.assertEqual(event["universityId"], "unist")
            self.assertIn("9.3(목) 09:00~", event["rawSchedule"])
            self.assertEqual(event["timeLabels"], ["18:00"])
            for key in old[event["id"]]:
                if key not in {"rawSchedule", "description"}:
                    self.assertEqual(event[key], old[event["id"]][key])
        self.assertTrue(set(old).issubset({e["id"] for e in self.data["events"]}))

    def test_registration_and_counts(self):
        events = self.data["events"]
        registrations = [e for e in events if e["categoryId"] == "registration"]
        self.assertEqual(len(registrations), 1)
        event = registrations[0]
        self.assertEqual((event["universityId"], event["admissionDetail"]), ("unist", "그릿인재전형"))
        self.assertEqual((event["startDate"], event["endDate"], event["deadlineDate"]),
                         ("2026-12-21", "2026-12-23", "2026-12-23"))
        self.assertEqual(event["timeLabels"], ["16:00"])
        self.assertEqual(len(events), len(self.before["events"]) + 1)
        self.assertEqual(self.data["meta"]["eventCount"], len(events))
        self.assertEqual(len({e["uid"] for e in events}), len(events))
        for category in self.data["categories"]:
            self.assertEqual(category["eventCount"], sum(e["categoryId"] == category["id"] for e in events))
        for university in self.data["universities"]:
            self.assertEqual(university["eventCount"], sum(e["universityId"] == university["id"] for e in events))
        ics = '\n'.join(generator.unfold_ics(generator.build_ics(registrations).decode()))
        self.assertIn("DTSTART;VALUE=DATE:20261221", ics)
        self.assertIn("DTEND;VALUE=DATE:20261224", ics)
        self.assertIn("16:00", ics)

    def test_other_ics_events_unchanged(self):
        import re
        before = generator.build_ics(self.before["events"]).decode().replace("\r\n", "\n")
        after = generator.build_ics(self.data["events"]).decode().replace("\r\n", "\n")
        def by_uid(raw):
            return {re.search(r"UID:([^\n]+)", block).group(1): block
                    for block in re.findall(r"BEGIN:VEVENT\n.*?END:VEVENT", raw, re.S)}
        old, new = by_uid(before), by_uid(after)
        changed_uids = {e["uid"] for e in self.data["events"] if e["universityId"] == "unist"
                        and e["categoryId"] in {"application", "essay", "documents"}}
        for uid, block in old.items():
            if uid not in changed_uids:
                self.assertEqual(block, new[uid])

    def test_table_no_registration_leakage(self):
        old_rows = {r["id"]: r for p in self.before["admissionsTable"]["pages"] for r in p["rows"]}
        found = []
        for page in self.data["admissionsTable"]["pages"]:
            for row in page["rows"]:
                if row["universityId"] != "unist":
                    self.assertEqual(row, old_rows[row["id"]])
                cell = row["cells"].get("registration")
                if cell:
                    found.append(row)
                    self.assertEqual(cell, {"text": "12.21(월)~12.23(수) 16:00", "rowSpan": 1})
                for key in ("application", "essay", "documents"):
                    if row["universityId"] == "unist" and row["cells"][key]:
                        self.assertIn("09:00", row["cells"][key]["text"])
                        self.assertEqual(row["cells"][key]["rowSpan"], 3)
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["cells"]["admissionType"]["text"], "그릿인재전형")


if __name__ == "__main__":
    unittest.main()
