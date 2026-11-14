import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, getToken, useMe } from "../lib/auth";

export default function ProtectedRoute() {
  const queryClient = useQueryClient();
  const token = getToken();
  const { isLoading, isError } = useMe();

  useEffect(() => {
    if (token && isError) {
      clearToken();
      queryClient.removeQueries({ queryKey: ["me"] });
    }
  }, [token, isError, queryClient]);

  if (!token) return <Navigate to="/login" replace />;
  if (isLoading) return <p className="p-8 text-slate-500">Loading…</p>;
  if (isError) return <Navigate to="/login" replace />;

  return <Outlet />;
}