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

    // TODO: validate slug is URL-safe and unique (Prisma will throw P2002
    // if not — errorHandler already converts that into a friendly message).
    // TODO: update the user's role to "owner" alongside creating the business.

    const business = await prisma.business.create({
      data: { name, slug, timezone, ownerId: req.user.id },
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
