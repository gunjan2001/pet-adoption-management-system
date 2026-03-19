import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyToken, extractTokenFromHeader } from "./auth";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // First, try JWT token authentication (for email/password login)
    const authHeader = opts.req.headers.authorization;
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          const userData = await getUserById(decoded.userId);
          if (userData) {
            user = userData;
          }
        }
      }
    }

    // If JWT auth failed, try OAuth authentication (optional - only if user has cookies)
    if (!user && opts.req.cookies) {
      try {
        const oauthUser = await sdk.authenticateRequest(opts.req);
        if (oauthUser) {
          user = oauthUser;
        }
      } catch (oauthError) {
        // OAuth authentication optional - don't block on failure
        // user remains null for public access
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
