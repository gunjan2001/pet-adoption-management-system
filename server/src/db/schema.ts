// src/db/schema.ts
import {
  serial,
  integer,
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const genderEnum = pgEnum("gender", ["male", "female", "unknown"]);
export const petStatusEnum = pgEnum("pet_status", ["available", "adopted", "pending"]);
export const adoptionStatusEnum = pgEnum("adoption_status", ["pending", "approved", "rejected"]);

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Pets ─────────────────────────────────────────────────────────────────────
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 255 }),
  age: integer("age"),
  gender: genderEnum("gender").default("unknown"),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  status: petStatusEnum("status").default("available").notNull(),
  adoptionFee: numeric("adoptionFee", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const petMedia = pgTable("pet_media", {
  id: serial("id").primaryKey(),
  petId: integer("petId")
    .notNull()
    .references(() => pets.id, { onDelete: "cascade" }),
  mediaId: integer("mediaId")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  sequence: integer("sequence").default(0), // for ordering media items
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  checksum: text("checksum").notNull(), // path to the media file
});


export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

// ── Adoption Applications ─────────────────────────────────────────────────────
export const adoptionApplications = pgTable("adoption_applications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  petId: integer("petId").notNull().references(() => pets.id),
  status: adoptionStatusEnum("status").default("pending").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  homeType: varchar("homeType", { length: 100 }),
  hasYard: boolean("hasYard").default(false),
  otherPets: text("otherPets"),
  experience: text("experience"),
  reason: text("reason"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdoptionApplication = typeof adoptionApplications.$inferSelect;
export type InsertAdoptionApplication = typeof adoptionApplications.$inferInsert;
