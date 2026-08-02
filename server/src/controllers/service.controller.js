import { prisma } from "../config/db.js";

// GET /api/services?category=&q= — used by the homepage results grid
export async function listServices(req, res, next) {
  try {
    const { category, q } = req.query;

    const services = await prisma.service.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { business: true },
    });

    res.json(services);
  } catch (err) {
    next(err);
  }
}

// POST /api/services — owner-only, add a new service to their business
export async function createService(req, res, next) {
  try {
    // TODO: pull businessId from req.user's own business (req.user.id ->
    // business.ownerId), don't trust a businessId sent in the body.
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    // TODO: same ownership check as createService.
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}
