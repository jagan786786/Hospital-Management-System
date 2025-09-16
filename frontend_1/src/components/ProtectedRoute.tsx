import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NotAuthenticated from "@/components/NotAuthenticated";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/unauthorized" replace />;

  return children;
}
