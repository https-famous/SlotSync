import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: err.issues[0].message,
      field: err.issues[0].path[0],
    });
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "value";
    return res.status(409).json({ error: `That ${field} is already taken` });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
}