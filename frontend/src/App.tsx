import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <MedicalSidebar />
            
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header with proper spacing for sidebar */}
              <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-full items-center px-4">
                  <SidebarTrigger className="mr-4" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">Medical Dashboard</h2>
                  </div>
                </div>
              </header>
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<PatientList />} />
                  <Route path="/patient/:patientId" element={<PrescriptionPage />} />
                  <Route path="/prescription" element={<PrescriptionPage />} />
                  <Route path="/patient-onboarding" element={<PatientOnboarding />} />
                  <Route path="/patient-records" element={<PatientRecords />} />
                  <Route path="/appointment-scheduling" element={<AppointmentScheduling />} />
                  <Route path="/appointments" element={<AppointmentManagement />} />
                  <Route path="/medicine-stock" element={<MedicineStock />} />
                  <Route path="/stock-reports" element={<StockReports />} />
                  <Route path="/employee-onboarding" element={<EmployeeOnboarding />} />
                  <Route path="/employees" element={<EmployeeList />} />
                  <Route path="/screens" element={<ScreensManagement />} />
                  <Route path="/user-roles" element={<UserRoleManagement />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;