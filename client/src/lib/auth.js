import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me")).data,
    enabled: !!getToken(),
    retry: false,
  });
}