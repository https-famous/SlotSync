import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, useMe } from "../lib/auth";

export default function Home() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function logout() {
    clearToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-teal-700">Home</h1>
      <p>Signed in as {me?.name} ({me?.email})</p>
      <button
        onClick={logout}
        className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
      >
        Log out
      </button>
    </div>
  );
}