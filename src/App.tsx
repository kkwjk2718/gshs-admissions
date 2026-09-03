import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { FilterDialog } from "./components/FilterDialog";
import { MobileTabBar } from "./components/MobileTabBar";
import { AdmissionsProvider } from "./hooks/useAdmissions";
import { FilterDialogProvider, useFilterDialog } from "./hooks/useFilterDialog";
import { PreferencesProvider } from "./hooks/usePreferences";
import { CalendarPage } from "./pages/CalendarPage";
import { DeadlinesPage } from "./pages/DeadlinesPage";
import { SchedulePage } from "./pages/SchedulePage";

function FilterDialogHost() {
  const { open, closeDialog } = useFilterDialog();
  return <FilterDialog open={open} onClose={closeDialog} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AdmissionsProvider>
      <PreferencesProvider>
        <FilterDialogProvider>
          <div className="app-shell">
            <ScrollToTop />
            <AppHeader />
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/deadlines" element={<DeadlinesPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              {/* 첫 배포에서 목록이 / 였다. 저장해 둔 링크를 살려 둔다. */}
              <Route path="/calendar" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <MobileTabBar />
            <FilterDialogHost />
          </div>
        </FilterDialogProvider>
      </PreferencesProvider>
    </AdmissionsProvider>
  );
}
