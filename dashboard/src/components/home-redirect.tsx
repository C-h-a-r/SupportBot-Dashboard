import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { firstAllowedPath, hasPermission } from "@/lib/permissions";
import Overview from "@/pages/Overview";

export function HomeRedirect() {
  const { permissions } = useAuth();

  if (hasPermission(permissions, "overview")) {
    return <Overview />;
  }

  return <Navigate to={firstAllowedPath(permissions)} replace />;
}
