import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchPath,
} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MedicalSidebar } from "@/components/medical/MedicalSidebar";
import PatientList from "./pages/PatientList";
import PrescriptionPage from "./pages/PrescriptionPage";
import PatientOnboarding from "./pages/PatientOnboarding";
import PatientRecords from "./pages/PatientRecords";
import AppointmentScheduling from "./pages/AppointmentScheduling";
import AppointmentManagement from "./pages/AppointmentManagement";
import MedicineStock from "./pages/MedicineStock";
import Billing from "./pages/Billing";
import StockReports from "./pages/StockReports";
import EmployeeOnboarding from "./pages/EmployeeOnboarding";
import EmployeeList from "./pages/EmployeeList";
import ScreensManagement from "./pages/ScreensManagement";
import UserRoleManagement from "./pages/UserRoleManagement";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import NotAuthenticated from "./components/NotAuthenticated";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResetPasswordPage from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Layout wrapper to conditionally render sidebar/header
const Layout = ({ children }) => {
  const location = useLocation();

  // Pages where we DON'T want sidebar & header
  const noSidebarRoutes = ["/login", "/unauthorized", "/reset-password/:id"];

  const hideSidebar = noSidebarRoutes.some((route) =>
    matchPath({ path: route, end: true }, location.pathname)
  );

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
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<NotAuthenticated />} />
                <Route
                  path="/reset-password/:id"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <PatientList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/:patientId"
                  element={
                    <ProtectedRoute>
                      <PrescriptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/prescription" element={<PrescriptionPage />} />
                <Route
                  path="/patient-onboarding"
                  element={
                    <ProtectedRoute>
                      <PatientOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route path="/patient-records" element={<PatientRecords />} />
                <Route
                  path="/appointment-scheduling"
                  element={
                    <ProtectedRoute>
                      <AppointmentScheduling />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <AppointmentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-appointments"
                  element={
                    <ProtectedRoute>
                      <AppointmentManagement showOnlyDoctor />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/medicine-stock"
                  element={
                    <ProtectedRoute>
                      <MedicineStock />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stock-reports"
                  element={
                    <ProtectedRoute>
                      <StockReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-onboarding"
                  element={
                    <ProtectedRoute>
                      <EmployeeOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute>
                      <EmployeeList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/screens"
                  element={
                    <ProtectedRoute>
                      <ScreensManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-roles"
                  element={
                    <ProtectedRoute>
                      <UserRoleManagement />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
