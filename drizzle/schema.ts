import {
  integer,
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  date,
} from "drizzle-orm/pg-core";

// Define enums separately for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const genderEnum = pgEnum("gender", ["male", "female", "unknown"]);
export const petStatusEnum = pgEnum("pet_status", ["available", "adopted", "pending"]);
export const adoptionStatusEnum = pgEnum("adoption_status", ["pending", "approved", "rejected"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }), // bcrypt hashed password for JWT auth
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }), // "oauth" or "email"
  role: roleEnum().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pets table for adoption listings
 */
export const pets = pgTable("pets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }).notNull(), // dog, cat, rabbit, etc.
  breed: varchar("breed", { length: 255 }),
  age: integer("age"), // age in months
  gender: genderEnum().default("unknown"),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  status: petStatusEnum().default("available").notNull(),
  adoptionFee: numeric("adoptionFee", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Adoption applications table
 */
export const adoptionApplications = pgTable("adoption_applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  petId: integer("petId").notNull(),
  status: adoptionStatusEnum().default("pending").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  homeType: varchar("homeType", { length: 100 }), // house, apartment, etc.
  hasYard: boolean("hasYard").default(false),
  otherPets: text("otherPets"), // description of other pets
  experience: text("experience"), // pet ownership experience
  reason: text("reason"), // why they want to adopt
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdoptionApplication = typeof adoptionApplications.$inferSelect;
export type InsertAdoptionApplication = typeof adoptionApplications.$inferInsert;
