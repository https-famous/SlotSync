import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ListBusiness from "./pages/ListBusiness.jsx";
import BusinessProfile from "./pages/BusinessProfile.jsx";
import SlotPicker from "./pages/SlotPicker.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import ManageBooking from "./pages/ManageBooking.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminServices from "./pages/admin/Services.jsx";
import AdminAvailability from "./pages/admin/Availability.jsx";
import AdminBookings from "./pages/admin/Bookings.jsx";
import AdminAnalytics from "./pages/admin/Analytics.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

// TODO: wrap /dashboard/* and /account/* routes in a route guard once
// auth is wired up (redirect to /login if no token; redirect owners vs
// clients per the "account decides where you land" rule from the plan doc).

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Client / marketplace side */}
      <Route path="/" element={<Home />} />
      <Route path="/list-your-business" element={<ListBusiness />} />
      <Route path="/:businessSlug" element={<BusinessProfile />} />
      <Route path="/:businessSlug/book/:serviceId" element={<SlotPicker />} />
      <Route path="/:businessSlug/book/:serviceId/checkout" element={<Checkout />} />
      <Route path="/booking/confirmed" element={<Confirmation />} />
      <Route path="/account/bookings" element={<MyBookings />} />
      <Route path="/manage/:token" element={<ManageBooking />} />

      {/* Admin / owner side */}
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard/services" element={<AdminServices />} />
      <Route path="/dashboard/availability" element={<AdminAvailability />} />
      <Route path="/dashboard/bookings" element={<AdminBookings />} />
      <Route path="/dashboard/analytics" element={<AdminAnalytics />} />
      <Route path="/dashboard/settings" element={<AdminSettings />} />
    </Routes>
  );
}
