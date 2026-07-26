import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { firstAllowedPath, hasPermission } from "@/lib/permissions";

export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated, permissions } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(permissions, permission)) {
    return <Navigate to={firstAllowedPath(permissions)} replace />;
  }

  return <>{children}</>;
}
