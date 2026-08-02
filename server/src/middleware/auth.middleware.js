import jwt from "jsonwebtoken";

// Attaches req.user = { id, role } if a valid JWT is present.
// Use requireAuth on any route that needs a signed-in user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Use after requireAuth on owner-only routes (e.g. managing a business).
export function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ error: "Business account required" });
  }
  next();
}
