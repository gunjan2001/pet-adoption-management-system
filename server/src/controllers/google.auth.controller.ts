// server/src/controllers/google.auth.controller.ts
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { users } from "../db/schema";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (userId: number, role: "user" | "admin"): string => 
  jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
  expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
});

// export async function googleAuth(req: Request, res: Response) {
//   const { credential } = req.body;

//   if (!credential) {
//     return res.status(400).json({ success: false, message: "Google credential is required" });
//   }

//   // ── 1. Verify the ID token with Google ──────────────────────────────────
//   let payload: { email?: string; name?: string; sub?: string; picture?: string };
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     payload = ticket.getPayload() ?? {};
//   } catch {
//     return res.status(401).json({ success: false, message: "Invalid Google token" });
//   }

//   const { email, name, sub: googleId } = payload;

//   if (!email || !googleId) {
//     return res.status(400).json({ success: false, message: "Could not retrieve email from Google" });
//   }

//   // ── 2. Find existing user or create a new one ───────────────────────────
//   let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

//   if (user) {
//     // User exists — update lastSignedIn and ensure loginMethod reflects Google
//     await db
//       .update(users)
//       .set({ lastSignedIn: new Date(), loginMethod: "google" })
//       .where(eq(users.id, user.id));
//   } else {
//     // New user — create account, no password needed
//     [user] = await db
//       .insert(users)
//       .values({
//         email,
//         name: name ?? email.split("@")[0],
//         password: "",          // empty — Google users never use password login
//         role: "user",
//         loginMethod: "google",
//         lastSignedIn: new Date(),
//       })
//       .returning();
//   }

//   // ── 3. Sign JWT — identical to regular login ────────────────────────────
//   const token = signToken(user.id, user.role);

//   // ── 4. Return same shape as /auth/login so frontend reuses persistAuth ──
//   return res.status(200).json({
//     success: true,
//     message: "Google authentication successful",
//     token,
//     user: {
//       id:      user.id,
//       name:    user.name,
//       email:   user.email,
//       role:    user.role,
//       phone:   user.phone,
//       address: user.address,
//     },
//   });
// }

export async function googleAuth(req: Request, res: Response) {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ success: false, message: "Access token is required" });
  }

  // Verify by fetching Google userinfo directly
  let googleUser: { email?: string; name?: string; sub?: string };
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!response.ok) throw new Error("Invalid token");
    // @ts-ignore
    googleUser = await response.json();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }

  const { email, name } = googleUser;
  if (!email) {
    return res.status(400).json({ success: false, message: "Could not retrieve email from Google" });
  }

  // ── 2. Find existing user or create a new one ───────────────────────────
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    // User exists — update lastSignedIn and ensure loginMethod reflects Google
    await db
      .update(users)
      .set({ lastSignedIn: new Date(), loginMethod: "google" })
      .where(eq(users.id, user.id));
  } else {
    // New user — create account, no password needed
    [user] = await db
      .insert(users)
      .values({
        email,
        name: name ?? email.split("@")[0],
        password: "",          // empty — Google users never use password login
        role: "user",
        loginMethod: "google",
        lastSignedIn: new Date(),
      })
      .returning();
  }

  // ── 3. Sign JWT — identical to regular login ────────────────────────────
  const token = signToken(user.id, user.role);

  // ── 4. Return same shape as /auth/login so frontend reuses persistAuth ──
  return res.status(200).json({
    success: true,
    message: "Google authentication successful",
    token,
    user: {
      id:      user.id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      phone:   user.phone,
      address: user.address,
    },
  });
}


