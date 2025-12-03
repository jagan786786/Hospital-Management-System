import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Activity,
  ChevronRight,
  Shield,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import medicalLogo from "@/assets/medical-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export function MedicalSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  const { user, logout } = useAuth();

  const userInfo = {
    name: user?.name || "Guest",
    roles: user?.roles || "User", // ✅ string only
    avatar: "",
  };

  const navigationSections = [
    {
      title: "Patient Management",
      defaultOpen: true,
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
      defaultOpen: false,
      items: [
        { title: "Patient Queue", url: "/", icon: Users },
        { title: "My Appointments", url: "/my-appointments", icon: Calendar },
      ],
    },
    {
      title: "Inventory Management",
      defaultOpen: false,
      items: [
        { title: "Medicine Stock", url: "/medicine-stock", icon: Activity },
        { title: "Billing", url: "/billing", icon: FileText },
        { title: "Stock Reports", url: "/stock-reports", icon: FileText },
      ],
    },
    {
      title: "HR Management",
      defaultOpen: false,
      items: [
        {
          title: "Employee Onboarding",
          url: "/employee-onboarding",
          icon: Users,
        },
        { title: "View Employees", url: "/employees", icon: Users },
      ],
    },
    {
      title: "Administration",
      defaultOpen: false,
      items: [
        { title: "Screen Access", url: "/screens", icon: Shield },
        { title: "User Roles", url: "/user-roles", icon: Users },
        { title: "System Settings", url: "/settings", icon: Settings },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    navigationSections.reduce((acc, section) => {
      acc[section.title] = section.defaultOpen;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-medical"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth";

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isSectionActive = (section: (typeof navigationSections)[0]) =>
    section.items.some((item) => isActive(item.url));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have successfully logged out",
    });
  };

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-72"
      } bg-gradient-sidebar border-r border-sidebar-border shadow-elegant transition-medical`}
      collapsible="icon"
    >
      <SidebarContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
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

        {/* User Info */}
        {!collapsed && (
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-sidebar-primary/30">
                <AvatarImage src={userInfo.avatar} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {userInfo.name
                    ? userInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "GU"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {userInfo.roles}
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

        {/* Navigation */}
        {navigationSections.map((section) => (
          <Collapsible
            key={section.title}
            open={collapsed ? true : openSections[section.title]}
            onOpenChange={() => !collapsed && toggleSection(section.title)}
          >
            <SidebarGroup className="px-3 py-2">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel
                  className={`text-sidebar-foreground/70 text-xs font-medium mb-2 cursor-pointer flex items-center justify-between ${
                    isSectionActive(section) ? "text-sidebar-primary" : ""
                  }`}
                >
                  {!collapsed ? (
                    <>
                      <span>{section.title.toUpperCase()}</span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform duration-200 ${
                          openSections[section.title] ? "rotate-90" : ""
                        }`}
                      />
                    </>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-sidebar-primary/50"></span>
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
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
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        {/* Logout */}
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
