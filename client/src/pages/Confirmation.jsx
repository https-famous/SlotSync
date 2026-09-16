import { useLocation, Link } from "react-router-dom";

export default function Confirmation() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-serif font-semibold mb-2">Booking confirmed</h1>
        {state?.service && (
          <p className="text-sm text-gray-500 mb-6">
            {state.service.name} — {new Date(state.startAt).toLocaleString()}
          </p>
        )}
        <Link to="/" className="text-teal font-semibold text-sm">
          Back to homepage →
        </Link>
      </div>
    </div>
  );
}