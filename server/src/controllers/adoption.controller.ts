// src/controllers/adoption.controller.ts
import { Request, Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import type { AuthRequest } from "../types";
import db from "../config/db.js";
import { adoptionApplications, pets, users } from "../db/schema.js";
import {
  CreateApplicationInput,
  ReviewApplicationInput,
} from "../validators/schemas.js";

// ── Submit Application (authenticated user) ───────────────────────────────────
export const submitApplication = async (
  req: Request<{}, {}, CreateApplicationInput>,
  res: Response
): Promise<void> => {
  try {
    const { petId, ...applicationData } = req.body;
    const userId = (req as AuthRequest).user.id;

    // 1. Verify pet exists and is available
    const [pet] = await db
      .select({ id: pets.id, status: pets.status, name: pets.name })
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }
    if (pet.status !== "available") {
      res.status(409).json({
        success: false,
        message: `${pet.name} is currently ${pet.status} and cannot be applied for`,
      });
      return;
    }

    // 2. Prevent duplicate pending applications from same user for same pet
    const [duplicate] = await db
      .select({ id: adoptionApplications.id })
      .from(adoptionApplications)
      .where(
        and(
          eq(adoptionApplications.userId, userId),
          eq(adoptionApplications.petId, petId),
          eq(adoptionApplications.status, "pending")
        )
      )
      .limit(1);

    if (duplicate) {
      res.status(409).json({
        success: false,
        message: "You already have a pending application for this pet",
      });
      return;
    }

    // 3. Create application
    const [application] = await db
      .insert(adoptionApplications)
      .values({ userId, petId, ...applicationData })
      .returning();

    // 4. Mark pet as "pending"
    await db
      .update(pets)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(pets.id, petId));

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Get My Applications (authenticated user) ──────────────────────────────────
export const getMyApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.id;

    const rows = await db
      .select({
        application: adoptionApplications,
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          imageUrl: pets.imageUrl,
          status: pets.status,
        },
      })
      .from(adoptionApplications)
      .innerJoin(pets, eq(adoptionApplications.petId, pets.id))
      .where(eq(adoptionApplications.userId, userId))
      .orderBy(adoptionApplications.createdAt);

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Get Single Application (owner or admin) ───────────────────────────────────
export const getApplicationById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      res.status(400).json({ success: false, message: "Invalid application ID" });
      return;
    }

    const [row] = await db
      .select({
        application: adoptionApplications,
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          imageUrl: pets.imageUrl,
        },
        applicant: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(adoptionApplications)
      .innerJoin(pets, eq(adoptionApplications.petId, pets.id))
      .innerJoin(users, eq(adoptionApplications.userId, users.id))
      .where(eq(adoptionApplications.id, appId))
      .limit(1);

    if (!row) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    const authReq = req as unknown as AuthRequest;
    // Regular users can only view their own applications
    if (
      authReq.user.role !== "admin" &&
      row.application.userId !== authReq.user.id
    ) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: row });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Get All Applications (admin only) ────────────────────────────────────────
export const getAllApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) ?? "1", 10);
    const limit = parseInt((req.query.limit as string) ?? "10", 10);
    const status = req.query.status as
      | "pending"
      | "approved"
      | "rejected"
      | undefined;
    const offset = (page - 1) * limit;

    const filter = status
      ? eq(adoptionApplications.status, status)
      : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select({
          application: adoptionApplications,
          pet: {
            id: pets.id,
            name: pets.name,
            species: pets.species,
            imageUrl: pets.imageUrl,
          },
          applicant: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(adoptionApplications)
        .innerJoin(pets, eq(adoptionApplications.petId, pets.id))
        .innerJoin(users, eq(adoptionApplications.userId, users.id))
        .where(filter)
        .orderBy(adoptionApplications.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(adoptionApplications)
        .where(filter),
    ]);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Review Application (admin only) ──────────────────────────────────────────
export const reviewApplication = async (
  req: Request<{ id: string }, {}, ReviewApplicationInput>,
  res: Response
): Promise<void> => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      res.status(400).json({ success: false, message: "Invalid application ID" });
      return;
    }

    const { status, adminNotes } = req.body;

    const [app] = await db
      .select()
      .from(adoptionApplications)
      .where(eq(adoptionApplications.id, appId))
      .limit(1);

    if (!app) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }
    if (app.status !== "pending") {
      res.status(409).json({
        success: false,
        message: `Application has already been ${app.status}`,
      });
      return;
    }

    // Update this application
    const [updated] = await db
      .update(adoptionApplications)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(adoptionApplications.id, appId))
      .returning();

    // Cascade pet status
    const petStatus = status === "approved" ? "adopted" : "available";
    await db
      .update(pets)
      .set({ status: petStatus, updatedAt: new Date() })
      .where(eq(pets.id, app.petId));

    // If approved → auto-reject all other pending applications for the same pet
    if (status === "approved") {
      await db
        .update(adoptionApplications)
        .set({
          status: "rejected",
          adminNotes: "Another application was approved for this pet.",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(adoptionApplications.petId, app.petId),
            eq(adoptionApplications.status, "pending")
          )
        );
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Review application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Withdraw Application (user – pending only) ────────────────────────────────
export const withdrawApplication = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      res.status(400).json({ success: false, message: "Invalid application ID" });
      return;
    }

    const userId = (req as unknown as AuthRequest).user.id;

    const [app] = await db
      .select()
      .from(adoptionApplications)
      .where(
        and(
          eq(adoptionApplications.id, appId),
          eq(adoptionApplications.userId, userId)
        )
      )
      .limit(1);

    if (!app) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }
    if (app.status !== "pending") {
      res.status(409).json({
        success: false,
        message: "Only pending applications can be withdrawn",
      });
      return;
    }

    await db
      .delete(adoptionApplications)
      .where(eq(adoptionApplications.id, appId));

    // Revert pet to "available" if no other pending applications exist
    const [otherPending] = await db
      .select({ id: adoptionApplications.id })
      .from(adoptionApplications)
      .where(
        and(
          eq(adoptionApplications.petId, app.petId),
          eq(adoptionApplications.status, "pending")
        )
      )
      .limit(1);

    if (!otherPending) {
      await db
        .update(pets)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(pets.id, app.petId));
    }

    res
      .status(200)
      .json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
