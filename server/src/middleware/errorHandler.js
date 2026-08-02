export function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma unique constraint violation — this is how the double-booking
  // guard (Booking @@unique) surfaces to the client.
  if (err.code === "P2002") {
    return res.status(409).json({ error: "That slot was just booked. Please pick another." });
  }

  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
}
