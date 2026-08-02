import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Attach the JWT (once you've built login) on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // NOTE: fine for a portfolio project; a production app would use an
  // httpOnly cookie instead to avoid XSS exposure of the token.
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
