import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'hr';

interface UserPermissions {
  roles: Role[];
  canAccessScreen: (screenId: string) => boolean;
  hasRole: (role: Role) => boolean;
  loading: boolean;
}

export const useUserPermissions = (userId?: string): UserPermissions => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [screenPermissions, setScreenPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserPermissions(userId);
    } else {
      // If no userId, try to get current user
      getCurrentUserPermissions();
    }
  }, [userId]);

  const getCurrentUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadUserPermissions(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (uid: string) => {
    try {
      setLoading(true);

      // Load user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid);

      if (rolesError) throw rolesError;

      const userRolesList = userRoles?.map(ur => ur.role as Role) || [];
      setRoles(userRolesList);

      // Load screen permissions for user's roles
      if (userRolesList.length > 0) {
        const { data: permissions, error: permissionsError } = await supabase
          .from('screen_permissions')
          .select('*')
          .in('role', userRolesList)
          .eq('enabled', true);

        if (permissionsError) throw permissionsError;
        setScreenPermissions(permissions || []);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessScreen = (screenId: string): boolean => {
    return screenPermissions.some(permission => 
      permission.screen_id === screenId && permission.enabled
    );
  };

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  return {
    roles,
    canAccessScreen,
    hasRole,
    loading
  };
};