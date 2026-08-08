import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageSpinner from "../components/common/PageSpinner";

export default function AdminRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
