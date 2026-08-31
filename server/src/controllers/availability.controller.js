import { prisma } from "../config/db.js";

// GET /api/availability/mine
export async function getMyAvailability(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(404).json({ error: "You don't have a business yet" });

    const rules = await prisma.availabilityRule.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: "asc" },                         //"asc" means arrange by ascending order the days of the week are in numbers of 0-6
    });

    res.json(rules);
  } catch (err) {
    next(err);
  }
}

// PUT /api/availability — replace-all: simplest correct behavior for a
// weekly-hours editor. The whole week is submitted together, so we wipe
// old rules and recreate them from what was just submitted.
export async function setAvailability(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { ownerId: req.user.id } });
    if (!business) return res.status(404).json({ error: "You don't have a business yet" });

    const { rules } = req.body; // [{ dayOfWeek, startTime, endTime }]
    if (!Array.isArray(rules)) {
      return res.status(400).json({ error: "rules must be an array" });
    }

    // $transaction: both operations succeed together, or neither happens —
    // avoids ever leaving the business with zero availability if the second
    // step fails partway through.
    await prisma.$transaction([
      prisma.availabilityRule.deleteMany({ where: { businessId: business.id } }),
      prisma.availabilityRule.createMany({
        data: rules.map((r) => ({
          businessId: business.id,
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
        })),
      }),
    ]);

    const updated = await prisma.availabilityRule.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}