import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ListBusiness() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();   // this useform() is tied to the form attribute 

  async function onSubmit(data) {
    setServerError("");
    try {
      await api.post("/businesses", data);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-stone px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-serif font-semibold mb-1">List your business</h1>
        <p className="text-sm text-gray-500 mb-6">
          Set up your business to start taking bookings and deposits on SlotSync.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}      // This line takes whatever is been passed in the onsubmit function that ran some lines above and places it in the onsubmit variable
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Business name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Fade & Co. Barbershop"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Booking URL</label>
            <div className="flex items-center border rounded-lg overflow-hidden text-sm">
              <span className="bg-gray-50 px-3 py-2 text-gray-400">slotsync.app/</span>
              <input
                {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })}
                className="flex-1 px-3 py-2 outline-none"
                placeholder="fade-and-co"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Timezone</label>
            <input
              {...register("timezone")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Africa/Lagos"
              defaultValue="Africa/Lagos"
            />
          </div>

          {serverError && <p className="text-sm text-rust">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}    // this line helps to prevent double click  {isSubmitting ? "Creating…" : "Create business & go to dashboard →"}   this switches betweencreating or create business depending on the value we got from here 
            className="w-full bg-teal text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create business & go to dashboard →"}   
          </button>
        </form>
      </div>
    </div>
  );
}