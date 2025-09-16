import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Calendar, Activity, FileText, Settings } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminSetup from "@/components/AdminSetup";

interface ScreenAccess {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

interface ScreenPermission {
  screen_id: string;
  role: string;
  enabled: boolean;
}

type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'hr';

const availableScreens: ScreenAccess[] = [
  // Patient Management
  { id: "patient-queue", name: "Patient Queue", description: "View and manage patient queue", category: "Patient Management", path: "/", icon: Users, roles: ["doctor", "nurse"] },
  { id: "patient-onboarding", name: "Patient Onboarding", description: "Register new patients", category: "Patient Management", path: "/patient-onboarding", icon: Users, roles: ["receptionist", "nurse"] },
  { id: "patient-records", name: "Patient Records", description: "Access patient medical records", category: "Patient Management", path: "/patient-records", icon: FileText, roles: ["doctor", "nurse"] },
  { id: "appointment-scheduling", name: "Schedule Appointment", description: "Book new appointments", category: "Patient Management", path: "/appointment-scheduling", icon: Calendar, roles: ["receptionist"] },
  { id: "appointments", name: "Appointments", description: "Manage appointments", category: "Patient Management", path: "/appointments", icon: Calendar, roles: ["doctor", "nurse", "receptionist"] },
  
  // Doctor Management
  { id: "prescription", name: "Prescription", description: "Create and manage prescriptions", category: "Doctor Management", path: "/prescription", icon: FileText, roles: ["doctor"] },
  
  // Inventory Management
  { id: "medicine-stock", name: "Medicine Stock", description: "Manage medicine inventory", category: "Inventory Management", path: "/medicine-stock", icon: Activity, roles: ["pharmacist", "admin"] },
  { id: "stock-reports", name: "Stock Reports", description: "View inventory reports", category: "Inventory Management", path: "/stock-reports", icon: FileText, roles: ["pharmacist", "admin"] },
  
  // HR Management
  { id: "employee-onboarding", name: "Employee Onboarding", description: "Register new employees", category: "HR Management", path: "/employee-onboarding", icon: Users, roles: ["hr", "admin"] },
  { id: "employees", name: "View Employees", description: "Manage employee list", category: "HR Management", path: "/employees", icon: Users, roles: ["hr", "admin"] },
  
  // Administration
  { id: "screens", name: "Screen Access", description: "Manage screen permissions", category: "Administration", path: "/screens", icon: Shield, roles: ["admin"] },
  { id: "settings", name: "System Settings", description: "System configuration", category: "Administration", path: "/settings", icon: Settings, roles: ["admin"] },
];

const allRoles: Role[] = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'hr'];

const ScreensManagement = () => {
  const [screenPermissions, setScreenPermissions] = useState<ScreenPermission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  const categories = ["All", ...Array.from(new Set(availableScreens.map(screen => screen.category)))];

  useEffect(() => {
    loadScreenPermissions();
  }, []);

  const loadScreenPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('screen_permissions')
        .select('*');
      
      if (error) throw error;
      
      setScreenPermissions(data || []);
    } catch (error) {
      console.error('Error loading screen permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load screen permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScreenPermission = async (screenId: string, role: Role, enabled: boolean) => {
    const permissionKey = `${screenId}-${role}`;
    
    try {
      // Add to updating set to show loading state
      setUpdatingPermissions(prev => new Set([...prev, permissionKey]));
      
      const { error } = await supabase
        .from('screen_permissions')
        .upsert({
          screen_id: screenId,
          role: role,
          enabled: enabled
        }, {
          onConflict: 'screen_id,role'
        });

      if (error) throw error;

      // Update local state immediately for better UX
      setScreenPermissions(prev => {
        const existingIndex = prev.findIndex(p => p.screen_id === screenId && p.role === role);
        if (existingIndex >= 0) {
          // Update existing permission
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], enabled };
          return updated;
        } else {
          // Add new permission
          return [...prev, { screen_id: screenId, role, enabled }];
        }
      });

      toast({
        title: "Success",
        description: `${enabled ? 'Granted' : 'Removed'} ${role} access to ${availableScreens.find(s => s.id === screenId)?.name}`,
      });
    } catch (error) {
      console.error('Error updating screen permission:', error);
      toast({
        title: "Error", 
        description: "Failed to update screen permission. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Remove from updating set
      setUpdatingPermissions(prev => {
        const updated = new Set(prev);
        updated.delete(permissionKey);
        return updated;
      });
    }
  };

  const toggleAllRolesForScreen = async (screenId: string, enable: boolean) => {
    const screenName = availableScreens.find(s => s.id === screenId)?.name;
    
    try {
      setUpdatingPermissions(prev => new Set([...prev, `bulk-${screenId}`]));
      
      const promises = allRoles.map(role =>
        supabase
          .from('screen_permissions')
          .upsert({
            screen_id: screenId,
            role: role,
            enabled: enable
          }, {
            onConflict: 'screen_id,role'
          })
      );

      const results = await Promise.all(promises);
      
      // Check for any errors
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        throw new Error('Some permissions failed to update');
      }

      // Update local state for all roles
      setScreenPermissions(prev => {
        const updated = [...prev];
        allRoles.forEach(role => {
          const existingIndex = updated.findIndex(p => p.screen_id === screenId && p.role === role);
          if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], enabled: enable };
          } else {
            updated.push({ screen_id: screenId, role, enabled: enable });
          }
        });
        return updated;
      });

      toast({
        title: "Success",
        description: `${enable ? 'Granted' : 'Removed'} all role access to ${screenName}`,
      });
    } catch (error) {
      console.error('Error toggling all roles:', error);
      toast({
        title: "Error",
        description: "Failed to update all permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPermissions(prev => {
        const updated = new Set(prev);
        updated.delete(`bulk-${screenId}`);
        return updated;
      });
    }
  };

  const getPermissionForRole = (screenId: string, role: Role): boolean => {
    const permission = screenPermissions.find(p => p.screen_id === screenId && p.role === role);
    return permission?.enabled || false;
  };

  const getScreenAccessCount = (screenId: string): number => {
    return allRoles.filter(role => getPermissionForRole(screenId, role)).length;
  };

  const getRoleAccessCount = (role: Role): number => {
    return availableScreens.filter(screen => getPermissionForRole(screen.id, role)).length;
  };

  const filteredScreens = selectedCategory === "All" 
    ? availableScreens 
    : availableScreens.filter(screen => screen.category === selectedCategory);

  const pagination = usePagination(filteredScreens, pageSize);

  const getRoleColor = (role: Role): string => {
    const colors: Record<Role, string> = {
      admin: "bg-red-100 text-red-800 border-red-200",
      doctor: "bg-blue-100 text-blue-800 border-blue-200", 
      nurse: "bg-green-100 text-green-800 border-green-200",
      receptionist: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pharmacist: "bg-purple-100 text-purple-800 border-purple-200",
      hr: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Patient Management": return Users;
      case "Doctor Management": return Shield;
      case "Inventory Management": return Activity;
      case "HR Management": return Users;
      case "Administration": return Settings;
      default: return Settings;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading screen permissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Screen Access Management</h1>
        <p className="text-muted-foreground">
          Manage which roles can access each screen in the system
        </p>
      </div>

      {/* Admin Setup Warning */}
      <AdminSetup />

      <Tabs defaultValue="table" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map(category => {
              const Icon = getCategoryIcon(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Screen Permissions
              </CardTitle>
              <CardDescription>
                Check the boxes to grant access to specific roles for each screen. ★ = Recommended role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[280px]">Screen</TableHead>
                      <TableHead className="w-[150px]">Category</TableHead>
                      <TableHead className="w-[80px] text-center">Access</TableHead>
                      {allRoles.map(role => (
                        <TableHead key={role} className="w-[100px] text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="capitalize font-medium">{role}</span>
                            <Badge variant="outline" className="text-xs">
                              {getRoleAccessCount(role)}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[120px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map(screen => {
                      const IconComponent = screen.icon;
                      const accessCount = getScreenAccessCount(screen.id);
                      
                      return (
                        <TableRow key={screen.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{screen.name}</div>
                                <div className="text-sm text-muted-foreground">{screen.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{screen.category}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={accessCount > 0 ? "default" : "secondary"}>
                              {accessCount}/{allRoles.length}
                            </Badge>
                          </TableCell>
                          {allRoles.map(role => {
                            const hasAccess = getPermissionForRole(screen.id, role);
                            const isRecommended = screen.roles.includes(role);
                            const permissionKey = `${screen.id}-${role}`;
                            const isUpdating = updatingPermissions.has(permissionKey);
                            
                            return (
                              <TableCell key={role} className="text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  <Checkbox
                                    checked={hasAccess}
                                    disabled={isUpdating}
                                    onCheckedChange={(checked) => {
                                      const newState = checked === true;
                                      updateScreenPermission(screen.id, role, newState);
                                    }}
                                    className={isUpdating ? "opacity-50" : ""}
                                  />
                                  {isRecommended && (
                                    <Badge variant="secondary" className="text-xs">
                                      ★
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAllRolesForScreen(screen.id, true)}
                                disabled={updatingPermissions.has(`bulk-${screen.id}`)}
                                className="text-xs px-2"
                              >
                                All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAllRolesForScreen(screen.id, false)}
                                disabled={updatingPermissions.has(`bulk-${screen.id}`)}
                                className="text-xs px-2"
                              >
                                None
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination 
                  {...pagination}
                  onPageSizeChange={(size) => setPageSize(size)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {availableScreens.filter(s => getScreenAccessCount(s.id) > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Screens</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{allRoles.length}</p>
                    <p className="text-sm text-muted-foreground">User Roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role Access Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allRoles.map(role => {
                    const accessCount = getRoleAccessCount(role);
                    
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getRoleColor(role)}`}></div>
                          <span className="capitalize font-medium">{role}</span>
                        </div>
                        <Badge variant="outline">{accessCount} screens</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.filter(cat => cat !== "All").map(category => {
                  const categoryScreens = availableScreens.filter(s => s.category === category);
                  const activeScreens = categoryScreens.filter(s => getScreenAccessCount(s.id) > 0);
                  
                  return (
                    <div key={category} className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold">{activeScreens.length}/{categoryScreens.length}</div>
                      <div className="text-sm text-muted-foreground">{category}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScreensManagement;