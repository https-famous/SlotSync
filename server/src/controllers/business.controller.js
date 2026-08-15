import { prisma } from "../config/db.js";

// GET /api/businesses?q=&category=  — powers the homepage search/filter
export async function listBusinesses(req, res, next) {
  try {
    const { q, category } = req.query;

    // TODO: filter businesses whose services match `category`, and/or whose
    // name or service name matches `q`. Remember: only include services
    // where active = true (see plan doc note on B2).
    const businesses = await prisma.business.findMany({
      include: { services: { where: { active: true } } },
    });

    res.json(businesses);
  } catch (err) {
    next(err);
  }
}

// GET /api/businesses/:slug — public business profile page
export async function getBusinessBySlug(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: req.params.slug },
      include: { services: { where: { active: true } } },
    });
    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch (err) {
    next(err);
  }
}

// POST /api/businesses — "List your business" flow.
// Turns the signed-in client account into a business owner.

export async function createBusiness(req, res, next) {
  try {
    const { name, slug, timezone } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Business name and URL slug are required" });
    }

    // One business per account. Business.ownerId is @unique in the schema too
    // (Prisma would throw P2002 either way) — checking first just lets us
    // return a clearer message than the generic "conflict" one.
    const existing = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: "You already have a business registered" });
    }

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        timezone: timezone || "UTC",
        ownerId: req.user.id,
      },
    });

    // Promote this account to "owner" now that it has a business — this is
    // the role requireOwner checks on service/availability management routes.
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: "owner" },
    });

    res.status(201).json(business);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/businesses/:id — owner-only, edit their own business
export async function updateBusiness(req, res, next) {
  try {
    // TODO: verify req.params.id belongs to req.user.id before updating —
    // this is the multi-tenancy scoping check.
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
}
