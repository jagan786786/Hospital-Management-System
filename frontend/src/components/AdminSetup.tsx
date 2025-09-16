import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    return user;
  };

  const makeCurrentUserAdmin = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to become an admin",
          variant: "destructive"
        });
        return;
      }

      // Add admin role to current user
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You are now an admin! You can manage all permissions.",
      });

    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enableStrictSecurity = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .rpc('enable_strict_security');

      if (error) throw error;

      toast({
        title: "Security Enabled",
        description: "Strict security policies are now active. Only admins can manage permissions.",
      });

    } catch (error) {
      console.error('Error enabling strict security:', error);
      toast({
        title: "Error", 
        description: "Failed to enable strict security",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Admin Setup Required
        </CardTitle>
        <CardDescription>
          Security is currently in bootstrap mode. Set up your first admin user and then enable strict security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            <strong>Current Status:</strong> Anyone can manage permissions (bootstrap mode)
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Step 1: Become Admin</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Grant yourself admin privileges to manage the system
            </p>
            <Button 
              onClick={makeCurrentUserAdmin}
              disabled={loading}
              className="w-full"
            >
              Make Me Admin
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-2">Step 2: Enable Strict Security</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Once you're admin, activate strict security policies
            </p>
            <Button 
              onClick={enableStrictSecurity}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Enable Strict Security
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p><strong>What happens next:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Only admins can manage screen permissions</li>
            <li>Users can only see their own roles</li>
            <li>Full RLS security will be active</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;