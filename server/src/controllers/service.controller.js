import { prisma } from "../config/db.js";

// GET /api/services?category=&q= — used by the homepage results grid (public)
export async function listServices(req, res, next) {
  try {
    const { category, q } = req.query;                             // q is a varaible meaning search item

    const services = await prisma.service.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),                                    // This two lines basically gets the category and the search item
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { business: true },                                             // This includes the business details 
    });

    res.json(services);      
  } catch (err) {
    next(err);
  }
}

// GET /api/services/mine — owner's own dashboard list, includes inactive ones
export async function listMyServices(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(404).json({ error: "You don't have a business yet" });

    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },                           
    });

    res.json(services);
  } catch (err) {
    next(err);
  }
}

// POST /api/services — owner-only, add a new service to their own business
export async function createService(req, res, next) {
  try {
    const { name, category, durationMin, priceCents, depositCents } = req.body;

    if (!name || !durationMin || !priceCents || depositCents == null) {
      return res.status(400).json({
        error: "name, durationMin, priceCents, and depositCents are required",
      });
    }

    // Never trust a businessId sent from the client — derive it from the
    // signed-in owner's own business. This IS the multi-tenancy scoping check.
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(404).json({ error: "You don't have a business yet" });

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        category: category || "other",
        durationMin: Number(durationMin),
        priceCents: Number(priceCents),
        depositCents: Number(depositCents),
      },
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/services/:id — owner-only, edit or deactivate a service
export async function updateService(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(404).json({ error: "You don't have a business yet" });

    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service || service.businessId !== business.id) {
      return res.status(404).json({ error: "Service not found" });
    }

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}