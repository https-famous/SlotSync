import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = isSignup
        ? form
        : { email: form.email, password: form.password };
      const { data } = await api.post(`/auth/${mode}`, body);
      setToken(data.token);
      queryClient.removeQueries({ queryKey: ["me"] });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-teal-700">SlotSync</h1>
        <p className="text-slate-500">
          {isSignup ? "Create your account" : "Sign in to continue"}
        </p>

        {isSignup && (
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={update}
            className={input}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update}
          className={input}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update}
          className={input}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setError("");
          }}
          className="w-full text-sm text-teal-700 hover:underline"
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}