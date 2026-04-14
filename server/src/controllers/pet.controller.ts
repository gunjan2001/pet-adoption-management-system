// src/controllers/pet.controller.ts
import { Request, Response } from "express";
import { eq, and, ilike, SQL, sql } from "drizzle-orm";
import db from "../config/db";             // ← no .js
import { pets } from "../db/schema";       // ← no .js
import type {
  CreatePetInput,
  UpdatePetInput,
  UpdatePetStatusInput,
  PaginationInput,
} from "../validators/schemas";            // ← no .js

// ── List Pets (public) ────────────────────────────────────────────────────────
export const getAllPets = async (
  req: Request<{}, {}, {}, PaginationInput>,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, status, species, gender } = req.query;
    
    const offset = (page - 1) * limit;

    const filters: SQL[] = [];
    if (status)  filters.push(eq(pets.status,  status));
    if (gender)  filters.push(eq(pets.gender,  gender));
    if (species) filters.push(ilike(pets.species, `%${species}%`));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(pets)
        .where(whereClause)
        .orderBy(pets.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pets)
        .where(whereClause),
    ]);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total:      count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get all pets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Get Single Pet (public) ───────────────────────────────────────────────────
export const getPetById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const petId = parseInt(req.params.id, 10);
    if (isNaN(petId)) {
      res.status(400).json({ success: false, message: "Invalid pet ID" });
      return;
    }

    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    console.error("Get pet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Create Pet (admin only) ───────────────────────────────────────────────────
export const createPet = async (
  req: Request<{}, {}, CreatePetInput>,
  res: Response
): Promise<void> => {
  try {
    const [pet] = await db.insert(pets).values(req.body).returning();
    res.status(201).json({ success: true, message: "Pet created", data: pet });
  } catch (error) {
    console.error("Create pet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Update Pet (admin only) ───────────────────────────────────────────────────
export const updatePet = async (
  req: Request<{ id: string }, {}, UpdatePetInput>,
  res: Response
): Promise<void> => {
  try {
    const petId = parseInt(req.params.id, 10);
    if (isNaN(petId)) {
      res.status(400).json({ success: false, message: "Invalid pet ID" });
      return;
    }

    const [existing] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }

    const [updated] = await db
      .update(pets)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(pets.id, petId))
      .returning();

    res.status(200).json({ success: true, message: "Pet updated", data: updated });
  } catch (error) {
    console.error("Update pet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Update Pet Status (admin only) ───────────────────────────────────────────
export const updatePetStatus = async (
  req: Request<{ id: string }, {}, UpdatePetStatusInput>,
  res: Response
): Promise<void> => {
  try {
    const petId = parseInt(req.params.id, 10);
    if (isNaN(petId)) {
      res.status(400).json({ success: false, message: "Invalid pet ID" });
      return;
    }

    const [updated] = await db
      .update(pets)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(pets.id, petId))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Pet status updated", data: updated });
  } catch (error) {
    console.error("Update pet status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Delete Pet (admin only) ───────────────────────────────────────────────────
export const deletePet = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const petId = parseInt(req.params.id, 10);
    if (isNaN(petId)) {
      res.status(400).json({ success: false, message: "Invalid pet ID" });
      return;
    }

    const [deleted] = await db
      .delete(pets)
      .where(eq(pets.id, petId))
      .returning({ id: pets.id });

    if (!deleted) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Delete pet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};