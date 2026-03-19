import { eq, and, like, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, pets, adoptionApplications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "address"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Pet queries
export async function listPets(filters: {
  species?: string;
  breed?: string;
  minAge?: number;
  maxAge?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { pets: [], total: 0 };

  const { species, breed, minAge, maxAge, status, search, limit = 12, offset = 0 } = filters;
  const conditions = [];

  if (species) conditions.push(eq(pets.species, species));
  if (breed) conditions.push(eq(pets.breed, breed));
  if (status) conditions.push(eq(pets.status, status as "available" | "adopted" | "pending"));
  if (search) conditions.push(like(pets.name, `%${search}%`));
  
  // Age filtering: minAge and maxAge are in years, convert to months
  if (minAge !== undefined) {
    conditions.push(sql`${pets.age} IS NULL OR ${pets.age} >= ${minAge * 12}`);
  }
  if (maxAge !== undefined) {
    conditions.push(sql`${pets.age} IS NULL OR ${pets.age} <= ${maxAge * 12}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(pets)
      .where(whereClause)
      .orderBy(desc(pets.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(pets)
      .where(whereClause),
  ]);

  return {
    pets: data,
    total: countResult[0]?.count || 0,
  };
}

export async function getPetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pets).where(eq(pets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPet(pet: typeof pets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pets).values(pet);
  return result;
}

export async function updatePet(id: number, updates: Partial<typeof pets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pets).set(updates).where(eq(pets.id, id));
}

export async function deletePet(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pets).where(eq(pets.id, id));
}

// Adoption application queries
export async function createAdoptionApplication(
  app: typeof adoptionApplications.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(adoptionApplications).values(app);
  return result;
}

export async function getApplicationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(adoptionApplications)
    .where(eq(adoptionApplications.userId, userId))
    .orderBy(desc(adoptionApplications.createdAt));
}

export async function getAllApplications(filters: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { applications: [], total: 0 };

  const { status, limit = 20, offset = 0 } = filters;
  const whereClause = status ? eq(adoptionApplications.status, status as "pending" | "approved" | "rejected") : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(adoptionApplications)
      .where(whereClause)
      .orderBy(desc(adoptionApplications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(adoptionApplications)
      .where(whereClause),
  ]);

  return {
    applications: data,
    total: countResult[0]?.count || 0,
  };
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adoptionApplications)
    .where(eq(adoptionApplications.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateApplicationStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: Record<string, unknown> = { status };
  if (adminNotes !== undefined) {
    updates.adminNotes = adminNotes;
  }

  await db.update(adoptionApplications).set(updates).where(eq(adoptionApplications.id, id));
}

export async function getApplicationsByPetId(petId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(adoptionApplications)
    .where(eq(adoptionApplications.petId, petId))
    .orderBy(desc(adoptionApplications.createdAt));
}

// Authentication functions

/**
 * Create a new user with email and hashed password
 */
export async function createUserWithEmail(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ id: number; email: string; name?: string; role: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .insert(users)
    .values({
      email: data.email,
      password: data.password,
      name: data.name,
      loginMethod: "email",
      role: "user",
      openId: `email_${data.email}`, // Generate a unique identifier for email-based users
      lastSignedIn: new Date(),
    })
    .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  if (result.length === 0) {
    throw new Error("Failed to create user");
  }

  const user = result[0];
  return {
    id: user.id,
    email: user.email || data.email,
    name: user.name || undefined,
    role: user.role,
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== undefined;
}
