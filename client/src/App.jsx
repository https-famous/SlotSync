import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}