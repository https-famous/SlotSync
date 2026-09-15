import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];                     // arrays that has value of 0-6

export default function AdminAvailability() {
  const queryClient = useQueryClient();                                                 
  const { data: rules, isLoading } = useQuery({
    queryKey: ["my-availability"],
    queryFn: () => api.get("/availability/mine").then((res) => res.data),
  });

  const [days, setDays] = useState(
    DAYS.map((_, i) => ({ dayOfWeek: i, open: false, startTime: "09:00", endTime: "17:00" }))   //this runs throughs days to get a value that we can select something lie a particular day
  );

  // Once the fetched rules arrive, populate local editable state from them.
  useEffect(() => {
    if (!rules) return;
    setDays((prev) => 
      prev.map((d) => {                                                                     
        const match = rules.find((r) => r.dayOfWeek === d.dayOfWeek);                      // this checks with the backend if r.dayofweek === matches with d.dayofweek
        return match                                                                       //then returns the match in this particular format
          ? { ...d, open: true, startTime: match.startTime, endTime: match.endTime }      
          : { ...d, open: false };
      })
    );
  }, [rules]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put("/availability", payload),                                    //this ai runs after handlesave function runs ro the /availabilty endpoint
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-availability"] }),             // on success the data saves here
  });

  function toggleDay(i) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, open: !d.open } : d)));
  }

  function updateTime(i, field, value) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }

  function handleSave() {                                     
    const openDays = days.filter((d) => d.open);                             //gets all the object that has open in the array
    saveMutation.mutate({                                                     // saves the value in this particular for at without open or closed column again
      rules: openDays.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      })),
    });
  }

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading…</div>;  // during s loaing it automatically returns this component

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-serif font-semibold mb-6">Availability</h1>

      <div className="bg-white border border-gray-200 rounded-xl divide-y">
        {days.map((d, i) => (
          <div key={d.dayOfWeek} className="flex items-center gap-4 p-4">
            <label className="flex items-center gap-2 w-28">
              <input type="checkbox" checked={d.open} onChange={() => toggleDay(i)} />
              <span className="text-sm font-semibold">{DAYS[d.dayOfWeek]}</span>
            </label>
            {d.open ? (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={d.startTime}
                  onChange={(e) => updateTime(i, "startTime", e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={d.endTime}
                  onChange={(e) => updateTime(i, "endTime", e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-400">Closed</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="mt-6 bg-teal text-white rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {saveMutation.isPending ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}