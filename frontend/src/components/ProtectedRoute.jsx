import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted">Memuat...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
