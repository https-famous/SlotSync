import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"   //useState("login") creates a piece of state, starting with the value "login".Whenever you call setMode("signup"), React re-runs this component function, and this time mode will be "signup"
  const [serverError, setServerError] = useState("");// similar to the usestste above
  const navigate = useNavigate();

  const {
    register, // This is how you connect a plain <input> to React Hook Form's internal state, without you manually wiring useState + onChange for every single field yourself.
    handleSubmit, //So you never manually call e.preventDefault() or manually collect field values — handleSubmit does both, then calls your function with clean data.
    formState: { isSubmitting },
  } = useForm(); // Calling useForm() gives back one big object with many tools inside it — validation state, error tracking, form values, reset functions, etc You're not using most of it here, so you destructure out only what you need: register, handleSubmit, and (nested inside another object) isSubmitting.

  async function onSubmit(data) {
    setServerError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const res = await api.post(endpoint, data);

      // Store the JWT so future requests (via lib/api.js) send it automatically.
      localStorage.setItem("token", res.data.token);

      // "Account decides where you land" — ask /me whether this account
      // owns a business, and route accordingly. No role toggle at login.
      const me = await api.get("/auth/me");                                // this line mainly helps us to get the response on the user from the prisma database 
      navigate(me.data.business ? "/dashboard" : "/");                       // This is what we use to navigate between ifthe owner has a business or not it access the user.business then redirects either to /dashboard or /
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif font-semibold text-center mb-1">SlotSync</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          {mode === "login"
            ? "Sign in to browse services and manage bookings."
            : "Create an account to get started."}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Full name
              </label>
              <input
                {...register("name", { required: mode === "signup" })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Amara Okafor"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          {serverError && <p className="text-sm text-rust">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-teal font-semibold">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-teal font-semibold">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}