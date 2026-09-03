import { Navigate, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/SiteHeader";
import { CalendarPage } from "./pages/CalendarPage";
import { SchedulePage } from "./pages/SchedulePage";

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
