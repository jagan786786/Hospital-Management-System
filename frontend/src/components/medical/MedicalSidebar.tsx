import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Activity,
  Stethoscope,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import medicalLogo from "@/assets/medical-logo.png";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://localhost:4000/api"; // Replace with your backend URL

export function MedicalSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const doctorInfo = {
    name: "Dr. Sarah Mitchell",
    specialty: "Internal Medicine",
    avatar: "",
  };

  const navigationSections = [
    {
      title: "Patient Management",
      items: [
        {
          title: "Patient Onboarding",
          url: "/patient-onboarding",
          icon: Users,
        },
        { title: "Patient Records", url: "/patient-records", icon: FileText },
        {
          title: "Schedule Appointment",
          url: "/appointment-scheduling",
          icon: Calendar,
        },
        { title: "Appointments", url: "/appointments", icon: Calendar },
      ],
    },
    {
      title: "Doctor Management",
      items: [
        { title: "Patient Queue", url: "/", icon: Users },
        { title: "My Appointments", url: "/appointments", icon: Calendar },
      ],
    },
    {
      title: "Inventory Management",
      items: [
        { title: "Medicine Stock", url: "/medicine-stock", icon: Activity },
        { title: "Stock Reports", url: "/stock-reports", icon: FileText },
      ],
    },
    {
      title: "HR Management",
      items: [
        {
          title: "Employee Onboarding",
          url: "/employee-onboarding",
          icon: Users,
        },
        { title: "View Employees", url: "/employees", icon: Users },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-medical"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth";

  // ----------------------
  // Logout Handler
  // ----------------------
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const userType = localStorage.getItem("userType") || "employee";

      // Call backend logout
      await axios.post(`${API_URL}/auth/logout`, { refreshToken, userType });

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userType");

      toast({
        title: "Logged out",
        description: "You have successfully logged out",
      });

      navigate("/login");
    } catch (err: any) {
      console.error("Logout failed", err);
      toast({
        title: "Logout failed",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-72"
      } bg-gradient-sidebar border-r border-sidebar-border shadow-elegant transition-medical`}
      collapsible="icon"
    >
      <SidebarContent className="p-0">
        {/* Header with Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
              <img src={medicalLogo} alt="Medical Logo" className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">
                  MediCare
                </h1>
                <p className="text-xs text-sidebar-foreground/70">
                  Admin Dashboard
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-sidebar-primary/30">
                <AvatarImage src={doctorInfo.avatar} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  SM
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {doctorInfo.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {doctorInfo.specialty}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs text-sidebar-foreground/70">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        {navigationSections.map((section) => (
          <SidebarGroup key={section.title} className="px-3 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium mb-2">
              {!collapsed ? section.title.toUpperCase() : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={getNavCls}
                      >
                        <item.icon
                          className={`${
                            collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
                          } flex-shrink-0`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Bottom Actions */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="h-11 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-smooth"
              >
                <LogOut
                  className={`${
                    collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
                  } flex-shrink-0`}
                />
                {!collapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
