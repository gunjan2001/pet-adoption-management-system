// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../config/db";           // ← no .js
import { users, User } from "../db/schema"; // ← no .js
import type { AuthRequest } from "../types"; // ← no .js, type-only import
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../validators/schemas"; // ← no .js

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (userId: number, role: "user" | "admin"): string =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });

const safeUser = (user: User): Omit<User, "password"> => {
  const { password: _password, ...rest } = user;
  return rest;
};

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check for duplicate email
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        phone:       phone       ?? null,
        address:     address     ?? null,
        loginMethod: "email",
        role:        "user",
      })
      .returning();

    if (!newUser) {
      console.error("Register: DB insert returned no rows");
      res.status(500).json({ success: false, message: "Failed to create account" });
      return;
    }

    const token = signToken(newUser.id, newUser.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: safeUser(newUser),
    });
  } catch (error) {
    // Detailed logging so you can see the actual DB error in server console
    console.error("Register error — full details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Constant-time comparison prevents timing attacks
    const dummyHash = "$2a$12$invalidhashfortimingattackprevention";
    const isValid = user
      ? await bcrypt.compare(password, user.password ?? dummyHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    // Update lastSignedIn
    await db
      .update(users)
      .set({ lastSignedIn: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const token = signToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login error — full details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({ success: true, user: (req as AuthRequest).user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileInput>,
  res: Response
): Promise<void> => {
  try {
    const { name, phone, address } = req.body;
    const userId = (req as AuthRequest).user.id;

    const [updated] = await db
      .update(users)
      .set({ name, phone, address, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    res.status(200).json({ success: true, user: safeUser(updated) });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};