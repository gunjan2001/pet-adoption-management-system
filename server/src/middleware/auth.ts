// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../config/db";          // ← no .js
import { users } from "../db/schema";   // ← no .js
import type { AuthRequest, AuthUser, JwtPayload } from "../types"; // ← no .js

/**
 * authenticate
 * Verifies Bearer JWT, re-fetches user from DB, attaches to req.user.
 */
export const authenticate = async (
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is missing or malformed",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (err) {
      const message =
        (err as Error).name === "TokenExpiredError"
          ? "Token has expired — please log in again"
          : "Invalid token";
      res.status(401).json({ success: false, message });
      return;
    }

    const [user] = await db
      .select({
        id:      users.id,
        name:    users.name,
        email:   users.email,
        role:    users.role,
        phone:   users.phone,
        address: users.address,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ success: false, message: "User account not found" });
      return;
    }

    (req as AuthRequest).user = user as AuthUser;
    next();
  } catch (error) {
    console.error("authenticate middleware error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * authorize
 * Role-based access control — must be used AFTER authenticate.
 */
export const authorize = (...allowedRoles: Array<"user" | "admin">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};