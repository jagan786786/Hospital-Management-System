import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MedicalSidebar } from "@/components/medical/MedicalSidebar";
import PatientList from "./pages/PatientList";
import PrescriptionPage from "./pages/PrescriptionPage";
import PatientOnboarding from "./pages/PatientOnboarding";
import PatientRecords from "./pages/PatientRecords";
import AppointmentScheduling from "./pages/AppointmentScheduling";
import AppointmentManagement from "./pages/AppointmentManagement";
import MedicineStock from "./pages/MedicineStock";
import StockReports from "./pages/StockReports";
import EmployeeOnboarding from "./pages/EmployeeOnboarding";
import EmployeeList from "./pages/EmployeeList";
import ScreensManagement from "./pages/ScreensManagement";
import UserRoleManagement from "./pages/UserRoleManagement";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import NotAuthenticated from "./components/NotAuthenticated";

const queryClient = new QueryClient();

// Layout wrapper to conditionally render sidebar/header
const Layout = ({ children }) => {
  const location = useLocation();

  // Pages where we DON'T want sidebar & header
  const noSidebarRoutes = ["/login", "/unauthorized"];

  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {!hideSidebar && <MedicalSidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        {!hideSidebar && (
          <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center px-4">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Medical Dashboard</h2>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<NotAuthenticated />} />
              <Route path="/" element={<PatientList />} />
              <Route
                path="/patient/:patientId"
                element={<PrescriptionPage />}
              />
              <Route path="/prescription" element={<PrescriptionPage />} />
              <Route
                path="/patient-onboarding"
                element={<PatientOnboarding />}
              />
              <Route path="/patient-records" element={<PatientRecords />} />
              <Route
                path="/appointment-scheduling"
                element={<AppointmentScheduling />}
              />
              <Route path="/appointments" element={<AppointmentManagement />} />
              <Route path="/medicine-stock" element={<MedicineStock />} />
              <Route path="/stock-reports" element={<StockReports />} />
              <Route
                path="/employee-onboarding"
                element={<EmployeeOnboarding />}
              />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/screens" element={<ScreensManagement />} />
              <Route path="/user-roles" element={<UserRoleManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
