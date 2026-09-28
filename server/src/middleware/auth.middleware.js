import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

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

// Source of truth is the database (does this user own a business?),
// not the role frozen inside the token at login time.
export async function requireOwner(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(403).json({ error: "Business account required" });
    next();
  } catch (err) {
    next(err);
  }
}