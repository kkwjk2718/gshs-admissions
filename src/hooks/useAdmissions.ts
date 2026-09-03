import { useEffect, useState } from "react";
import { parseAdmissionsIcs } from "../lib/ics";
import type { AdmissionEvent } from "../types";

interface AdmissionsState {
  events: AdmissionEvent[];
  loading: boolean;
  error: boolean;
}

export function useAdmissions(): AdmissionsState {
  const [state, setState] = useState<AdmissionsState>({ events: [], loading: true, error: false });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/admissions.ics", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("calendar unavailable");
        return response.text();
      })
      .then((source) => setState({ events: parseAdmissionsIcs(source), loading: false, error: false }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ events: [], loading: false, error: true });
      });

    return () => controller.abort();
  }, []);

  return state;
}

