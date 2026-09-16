import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

function nextNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function SlotPicker() {
  const { businessSlug, serviceId } = useParams();
  const navigate = useNavigate();
  const days = nextNDays(7);
  const [selectedDate, setSelectedDate] = useState(days[0]);

  const { data: business } = useQuery({
    queryKey: ["business", businessSlug],
    queryFn: () => api.get(`/businesses/${businessSlug}`).then((res) => res.data),
  });
  const service = business?.services.find((s) => s.id === serviceId);

  const dateStr = selectedDate.toISOString().slice(0, 10);
  const { data: slots, isLoading } = useQuery({
    queryKey: ["slots", serviceId, dateStr],
    queryFn: () =>
      api.get(`/bookings/slots?serviceId=${serviceId}&date=${dateStr}`).then((res) => res.data),
    enabled: !!serviceId,
  });

  function pickSlot(iso) {
    navigate(`/${businessSlug}/book/${serviceId}/checkout`, {
      state: { serviceId, startAt: iso, service, businessSlug },
    });
  }

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif font-semibold mb-1">
          {service ? service.name : "Pick a time"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Choose a day, then a time.</p>

        <div className="flex gap-2 overflow-x-auto mb-6">
          {days.map((d) => {
            const active = d.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm border ${
                  active ? "bg-ink text-stone border-ink" : "bg-white border-gray-200"
                }`}
              >
                {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading slots…</p>
        ) : slots?.length ? (
          <div className="grid grid-cols-3 gap-3">
            {slots.map((iso) => (
              <button
                key={iso}
                onClick={() => pickSlot(iso)}
                className="bg-white border border-gray-200 rounded-lg py-3 text-sm font-mono hover:border-teal"
              >
                {new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No open slots this day.</p>
        )}
      </div>
    </div>
  );
}