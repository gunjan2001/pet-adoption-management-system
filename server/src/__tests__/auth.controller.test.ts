import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

// ── DB mock ───────────────────────────────────────────────────────────────────
// Must be declared before any import that transitively loads the DB module.
// The auth controller uses a DEFAULT export:  import db from "../config/db"
// so the mock must expose a `default` property.
jest.mock("../config/db", () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// Prevent the Google OAuth controller from performing real network calls.
jest.mock("../controllers/google.auth.controller", () => ({
  __esModule: true,
  googleAuth: (_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) =>
    res.status(501).json({ message: "not implemented in tests" }),
}));

import db from "../config/db";
import authRoutes from "../routes/auth.routes";

// ── Environment setup ─────────────────────────────────────────────────────────
// jwt.sign() requires JWT_SECRET; set it before any test runs.
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-jest";
});

// ── Minimal Express app (avoids importing index.ts which starts a server) ─────
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

// ── Shared fixture ────────────────────────────────────────────────────────────
const mockUser = {
  id:       1,
  email:    "test@example.com",
  name:     "Test User",
  password: bcrypt.hashSync("Password1", 10),
  role:     "user" as const,
};

// ── Chain-builder helpers ─────────────────────────────────────────────────────
/** Mimics db.select().from().where().limit() → resolves to `rows` */
const selectChain = (rows: unknown[]) => ({
  from: () => ({ where: () => ({ limit: () => Promise.resolve(rows) }) }),
});

/** Mimics db.update().set().where() */
const updateChain = () => ({
  set: () => ({ where: () => Promise.resolve([]) }),
});

/** Mimics db.insert().values().returning() → resolves to `rows` */
const insertChain = (rows: unknown[]) => ({
  values: () => ({ returning: () => Promise.resolve(rows) }),
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(async () => jest.clearAllMocks());

  it("returns 400 when body is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notanemail", password: "Password1" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when user not found", async () => {
    (db.select as jest.Mock).mockReturnValue(selectChain([]));
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "Password1" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    (db.select as jest.Mock).mockReturnValue(selectChain([mockUser]));
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: mockUser.email, password: "WrongPass1" });
    expect(res.status).toBe(401);
  });

  it("returns 200 with token on valid credentials", async () => {
    // select() → finds the user; update() → records lastSignedIn
    (db.select as jest.Mock).mockReturnValue(selectChain([mockUser]));
    (db.update as jest.Mock).mockReturnValue(updateChain());

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: mockUser.email, password: "Password1" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user.email", mockUser.email);
    // Password must never be returned to the client
    expect(res.body.user).not.toHaveProperty("password");
  });
});

// ── Register ──────────────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  beforeEach(async () => jest.clearAllMocks());

  it("returns 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test@test.com", password: "weak" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@test.com", password: "Password1" });
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    (db.select as jest.Mock).mockReturnValue(selectChain([mockUser]));
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: mockUser.email, password: "Password1" });
    expect(res.status).toBe(409);
  });

  it("returns 201 with token on successful registration", async () => {
    const newUser = { ...mockUser, id: 2, email: "new@test.com" };
    // select() → no existing user; insert() → new user row
    (db.select as jest.Mock).mockReturnValue(selectChain([]));
    (db.insert as jest.Mock).mockReturnValue(insertChain([newUser]));

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "New User", email: "new@test.com", password: "Password1" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user.email", "new@test.com");
    expect(res.body.user).not.toHaveProperty("password");
  });
});