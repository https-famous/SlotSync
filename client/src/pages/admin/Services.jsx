import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";

export default function AdminServices() {
  const queryClient = useQueryClient();                              // useQueryClient () is uesd to refetch somethung or data from changed data

  const { data: services, isLoading } = useQuery({
    queryKey: ["my-services"],                                        // basically a unique label identifying the piece of dataAny other component that also calls useQuery({ queryKey: ["my-services"] }) shares the same cached data
    queryFn: () => api.get("/services/mine").then((res) => res.data),           //  This si the function that  feteches the data 
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const createMutation = useMutation({                                           // this s for writng data it doesn't run automatically waits to be triggered by createmutation.mutate()
    mutationFn: (data) => api.post("/services", data),                           // This is the actual function that runs when you call .mutate(payload)
    onSuccess: () => {                                                          //he data behind that label is now outdated — go refetch it." React Query automatically re-runs the original queryFn
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      reset();
    },
  });

  function onSubmit(data) {
    createMutation.mutate({
      name: data.name,
      category: data.category,
      durationMin: Number(data.durationMin),
      priceCents: Math.round(Number(data.price) * 100),
      depositCents: Math.round(Number(data.deposit) * 100),
    });
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-serif font-semibold mb-6">Services</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 rounded-xl p-5 mb-8 grid grid-cols-2 gap-3"
      >
        <input
          {...register("name", { required: true })}
          placeholder="Service name"
          className="border rounded-lg px-3 py-2 text-sm col-span-2"
        />
        <select {...register("category")} className="border rounded-lg px-3 py-2 text-sm">
          <option value="haircuts">Haircuts</option>
          <option value="massage">Massage</option>
          <option value="coaching">Coaching</option>
          <option value="consulting">Consulting</option>
          <option value="other">Other</option>
        </select>
        <input
          {...register("durationMin", { required: true })}
          type="number"
          placeholder="Duration (min)"
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          {...register("price", { required: true })}
          type="number"
          step="0.01"
          placeholder="Price"
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          {...register("deposit", { required: true })}
          type="number"
          step="0.01"
          placeholder="Deposit"
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="col-span-2 bg-teal text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Adding…" : "Add service"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {services?.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                {s.durationMin} MIN · {s.category}
              </div>
              <div className="font-serif text-lg mt-2">${(s.priceCents / 100).toFixed(2)}</div>
              <div className="text-xs text-teal font-semibold">
                ${(s.depositCents / 100).toFixed(2)} deposit
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}