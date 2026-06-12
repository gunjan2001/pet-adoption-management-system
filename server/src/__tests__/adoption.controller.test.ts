import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

// ── DB mock (default export, correct path) ────────────────────────────────────
jest.mock("../config/db", () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock email service so tests never hit SMTP
jest.mock("../services/email.service", () => ({
  __esModule: true,
  sendApplicationStatusEmail: jest.fn<() => Promise<void>>().mockResolvedValue(),
}));

import db from "../config/db";
import adoptionRoutes from "../routes/adoption.routes";

// ── Environment setup ─────────────────────────────────────────────────────────
// (JWT_SECRET and tokens are initialised in the beforeAll above)

// ── Minimal Express app ───────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use("/api/adoptions", adoptionRoutes);

// Tokens must be created after JWT_SECRET env is set — use lazy getters
let adminToken: string;
let userToken: string;

const mockAdminUser = { id: 1, name: "Admin", email: "admin@test.com", role: "admin", phone: null, address: null };
const mockRegularUser = { id: 2, name: "User", email: "user@test.com", role: "user", phone: null, address: null };

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-jest";
  adminToken = jwt.sign({ userId: 1, role: "admin" }, "test-secret-for-jest");
  userToken  = jwt.sign({ userId: 2, role: "user"  }, "test-secret-for-jest");
});

const mockApp = {
  id: 1, petId: 10, userId: 2, status: "pending", adminNotes: null,
};

/** Mimics db.select().from().where().limit() → resolves to `rows` */
const selectChain = (rows: unknown[]) => ({
  from: () => ({ where: () => ({ limit: () => Promise.resolve(rows) }) }),
});

/** Mimics db.update().set().where() and optionally .returning() */
const updateChain = (rows: unknown[] = []) => ({
  set: () => ({
    where: () => ({
      returning: () => Promise.resolve(rows),
      then: (resolve: (v: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
    }),
  }),
});

describe("PATCH /api/adoptions/:id/review", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns 401 without token", async () => {
    const res = await request(app)
      .patch("/api/adoptions/1/review")
      .send({ status: "approved" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin user", async () => {
    // authenticate → finds the regular user
    (db.select as jest.Mock).mockReturnValueOnce(selectChain([mockRegularUser]));
    const res = await request(app)
      .patch("/api/adoptions/1/review")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "approved" });
    expect(res.status).toBe(403);
  });

  it("returns 404 when application not found", async () => {
    // authenticate → finds admin; controller → no application row
    (db.select as jest.Mock)
      .mockReturnValueOnce(selectChain([mockAdminUser]))
      .mockReturnValueOnce(selectChain([]));
    const res = await request(app)
      .patch("/api/adoptions/999/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved" });
    expect(res.status).toBe(404);
  });

  it("returns 409 when application already reviewed", async () => {
    // authenticate → finds admin; controller → already-approved application
    (db.select as jest.Mock)
      .mockReturnValueOnce(selectChain([mockAdminUser]))
      .mockReturnValueOnce(selectChain([{ ...mockApp, status: "approved" }]));
    const res = await request(app)
      .patch("/api/adoptions/1/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "rejected" });
    expect(res.status).toBe(409);
  });
});