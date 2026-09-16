import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../lib/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ serviceId, startAt, service }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create the booking (status: pending) the moment this page loads.
  useEffect(() => {
    api
      .post("/bookings", { serviceId, startAt })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) => setError(err.response?.data?.error || "Could not start booking"));
  }, [serviceId, startAt]);

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setSubmitting(true);
    setError("");

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
    } else {
      navigate("/booking/confirmed", { state: { service, startAt } });
    }
  }

  return (
    <form onSubmit={handlePay} className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-4 text-sm">
        <div className="font-semibold">{service?.name}</div>
        <div className="text-gray-500 font-mono text-xs">{new Date(startAt).toLocaleString()}</div>
        <div className="text-teal font-semibold mt-2">
          Deposit due now: ${((service?.depositCents ?? 0) / 100).toFixed(2)}
        </div>
      </div>

      <div className="border rounded-lg px-3 py-3 mb-4">
        <CardElement />
      </div>

      {error && <p className="text-sm text-rust mb-3">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || !clientSecret || submitting}
        className="w-full bg-teal text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Processing…" : "Pay deposit & book"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Missing booking details — go back and pick a slot again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-serif font-semibold mb-6">Confirm your booking</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm {...state} />
        </Elements>
      </div>
    </div>
  );
}