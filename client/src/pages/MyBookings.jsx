import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-teal-100 text-teal-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-rust-100 text-rust-700",
  no_show: "bg-rust-100 text-rust-700",
  rescheduled: "bg-gray-100 text-gray-400",
};

export default function MyBookings() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get("/bookings/mine").then((res) => res.data),
  });

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif font-semibold mb-6">My Bookings</h1>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : !bookings?.length ? (
          <p className="text-sm text-gray-500">
            No bookings yet. <Link to="/" className="text-teal font-semibold">Browse services →</Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                to={`/manage/${b.manageToken}`}
                className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-teal"
              >
                <div>
                  <div className="font-semibold text-sm">{b.service.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{b.business.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    {new Date(b.startAt).toLocaleString()}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                  {b.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}