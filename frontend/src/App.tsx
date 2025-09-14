import { MedicalSidebar } from "@/components/medical/MedicalSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import AppointmentManagement from "./pages/AppointmentManagement";
import AppointmentScheduling from "./pages/AppointmentScheduling";
import EmployeeList from "./pages/EmployeeList";
import EmployeeOnboarding from "./pages/EmployeeOnboarding";
import LoginPage from "./pages/LoginPage";
import MedicineStock from "./pages/MedicineStock";
import NotFound from "./pages/NotFound";
import PatientList from "./pages/PatientList";
import PatientOnboarding from "./pages/PatientOnboarding";
import PatientRecords from "./pages/PatientRecords";
import PrescriptionPage from "./pages/PrescriptionPage";
import StockReports from "./pages/StockReports";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    // Centered login layout with a wider card
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-full max-w-3xl p-10 bg-white rounded-2xl shadow-lg">
          {children}
        </div>
      </div>
    );
  }

  // Default layout with sidebar + header
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <MedicalSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Medical Dashboard</h2>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected */}
              <Route path="/" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
              <Route path="/patient/:patientId" element={<ProtectedRoute><PrescriptionPage /></ProtectedRoute>} />
              <Route path="/prescription" element={<ProtectedRoute><PrescriptionPage /></ProtectedRoute>} />
              <Route path="/patient-onboarding" element={<ProtectedRoute><PatientOnboarding /></ProtectedRoute>} />
              <Route path="/patient-records" element={<ProtectedRoute><PatientRecords /></ProtectedRoute>} />
              <Route path="/appointment-scheduling" element={<ProtectedRoute><AppointmentScheduling /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentManagement /></ProtectedRoute>} />
              <Route path="/medicine-stock" element={<ProtectedRoute><MedicineStock /></ProtectedRoute>} />
              <Route path="/stock-reports" element={<ProtectedRoute><StockReports /></ProtectedRoute>} />
              <Route path="/employee-onboarding" element={<ProtectedRoute><EmployeeOnboarding /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
