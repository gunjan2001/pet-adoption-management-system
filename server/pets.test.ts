import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "admin" | "user" = "user", userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Pet Procedures", () => {
  describe("pets.list", () => {
    it("should list pets with pagination", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list({
        page: 1,
        limit: 12,
      });

      expect(result).toHaveProperty("pets");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.pets)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it("should filter pets by species", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list({
        page: 1,
        limit: 12,
        species: "dog",
      });

      expect(result).toHaveProperty("pets");
      expect(Array.isArray(result.pets)).toBe(true);
    });

    it("should filter pets by status", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list({
        page: 1,
        limit: 12,
        status: "available",
      });

      expect(result).toHaveProperty("pets");
      expect(Array.isArray(result.pets)).toBe(true);
    });

    it("should search pets by name", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.list({
        page: 1,
        limit: 12,
        search: "buddy",
      });

      expect(result).toHaveProperty("pets");
      expect(Array.isArray(result.pets)).toBe(true);
    });
  });

  describe("pets.detail", () => {
    it("should return pet not found error for invalid id", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pets.detail({ id: 99999 });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("pets.create", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pets.create({
          name: "Fluffy",
          species: "cat",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should create pet as admin", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pets.create({
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        age: 24,
        gender: "male",
        description: "A friendly golden retriever",
      });

      expect(result).toBeDefined();
    });

    it("should validate required fields", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pets.create({
          name: "",
          species: "",
        });
        expect.fail("Should throw validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("pets.update", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pets.update({
          id: 1,
          data: { name: "Updated" },
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("pets.delete", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pets.delete({ id: 1 });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

describe("Adoption Application Procedures", () => {
  describe("applications.submit", () => {
    it("should require authentication", async () => {
      const ctx = createMockContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.submit({
          petId: 1,
          fullName: "John Doe",
          email: "john@example.com",
          phone: "555-1234",
          address: "123 Main St",
          experience: "I have owned dogs for 10 years",
          reason: "I want to give a loving home to a pet",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should validate required fields", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.submit({
          petId: 1,
          fullName: "",
          email: "invalid",
          phone: "123",
          address: "123",
          experience: "short",
          reason: "short",
        });
        expect.fail("Should throw validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("applications.myApplications", () => {
    it("should require authentication", async () => {
      const ctx = createMockContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.myApplications();
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should return user's applications", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.applications.myApplications();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("applications.allApplications", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.allApplications({
          page: 1,
          limit: 20,
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return all applications for admin", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.applications.allApplications({
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty("applications");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.applications)).toBe(true);
    });

    it("should filter applications by status", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.applications.allApplications({
        page: 1,
        limit: 20,
        status: "pending",
      });

      expect(Array.isArray(result.applications)).toBe(true);
    });
  });

  describe("applications.approve", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.approve({
          id: 1,
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("applications.reject", () => {
    it("should require admin role", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.reject({
          id: 1,
          adminNotes: "Not suitable",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should require rejection reason", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.reject({
          id: 1,
          adminNotes: "",
        });
        expect.fail("Should throw validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Authorization", () => {
  it("should enforce admin-only access for pet creation", async () => {
    const userCtx = createMockContext("user");
    const adminCtx = createMockContext("admin");

    const userCaller = appRouter.createCaller(userCtx);
    const adminCaller = appRouter.createCaller(adminCtx);

    // User should fail
    try {
      await userCaller.pets.create({
        name: "Test",
        species: "dog",
      });
      expect.fail("User should not be able to create pets");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }

    // Admin should succeed
    const result = await adminCaller.pets.create({
      name: "Test",
      species: "dog",
    });
    expect(result).toBeDefined();
  });
});
