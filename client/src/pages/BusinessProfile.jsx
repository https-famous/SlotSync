import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function BusinessProfile() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessSlug],
    queryFn: () => api.get(`/businesses/${businessSlug}`).then((res) => res.data),
  });

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  if (!business) return <div className="p-8 text-sm text-gray-500">Business not found.</div>;

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif font-semibold">{business.name}</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a service to book an appointment.</p>

        <div className="flex flex-col gap-3">
          {business.services.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/${businessSlug}/book/${s.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-teal"
            >
              <div>
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-xs text-gray-400 font-mono">{s.durationMin} MIN</div>
              </div>
              <div className="text-right">
                <div className="font-serif text-lg">${(s.priceCents / 100).toFixed(2)}</div>
                <div className="text-xs text-teal font-semibold">
                  ${(s.depositCents / 100).toFixed(2)} deposit
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}