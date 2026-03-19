import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { hashPassword, comparePassword, generateToken } from "./_core/auth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  listPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  createAdoptionApplication,
  getApplicationsByUserId,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationsByPetId,
  createUserWithEmail,
  getUserByEmail,
  getUserById,
  emailExists,
} from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Pet listing schema
const petListSchema = z.object({
  species: z.string().optional(),
  breed: z.string().optional(),
  minAge: z.number().int().nonnegative().optional(),
  maxAge: z.number().int().nonnegative().optional(),
  status: z.enum(["available", "adopted", "pending"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(500).default(12),
});

// Pet creation schema
const petCreateSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  adoptionFee: z.string().optional(),
  status: z.enum(["available", "adopted", "pending"]).optional(),
});

// Validation schemas for auth
const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Adoption application schema
const adoptionApplicationSchema = z.object({
  petId: z.number().int().positive(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  homeType: z.string().optional(),
  hasYard: z.boolean().optional(),
  otherPets: z.string().optional(),
  experience: z.string().min(10, "Please describe your pet experience"),
  reason: z.string().min(20, "Please explain why you want to adopt"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    /**
     * Register a new user with email and password
     */
    register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      try {
        // Hash password
        const hashedPassword = await hashPassword(input.password);

        // Create user
        const newUser = await createUserWithEmail({
          email: input.email,
          password: hashedPassword,
          name: input.name,
        });

        // Generate JWT token
        const token = generateToken(newUser.id, newUser.role);

        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          },
          token,
        };
      } catch (error) {
        console.error("[Auth] Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register user",
        });
      }
    }),

    /**
     * Login user with email and password
     */
    login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);

      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      try {
        // Compare password
        const isPasswordValid = await comparePassword(input.password, user.password);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.role);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("[Auth] Login error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to login",
        });
      }
    }),
  }),

  // Pet endpoints
  pets: router({
    list: publicProcedure.input(petListSchema).query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const result = await listPets({
        species: input.species,
        breed: input.breed,
        minAge: input.minAge,
        maxAge: input.maxAge,
        status: input.status || "available",
        search: input.search,
        limit: input.limit,
        offset,
      });

      return {
        pets: result.pets,
        total: result.total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(result.total / input.limit),
      };
    }),

    detail: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const pet = await getPetById(input.id);
      if (!pet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
      }
      return pet;
    }),

    create: adminProcedure.input(petCreateSchema).mutation(async ({ input }) => {
      const result = await createPet({
        name: input.name,
        species: input.species,
        breed: input.breed,
        age: input.age,
        gender: input.gender,
        description: input.description,
        imageUrl: input.imageUrl,
        adoptionFee: input.adoptionFee ? parseFloat(input.adoptionFee).toString() : null,
        status: input.status || "available",
      });
      return result;
    }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          data: petCreateSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const pet = await getPetById(input.id);
        if (!pet) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
        }

        const updates: Record<string, any> = {};
        if (input.data.name !== undefined) updates.name = input.data.name;
        if (input.data.species !== undefined) updates.species = input.data.species;
        if (input.data.breed !== undefined) updates.breed = input.data.breed;
        if (input.data.age !== undefined) updates.age = input.data.age;
        if (input.data.gender !== undefined) updates.gender = input.data.gender;
        if (input.data.description !== undefined) updates.description = input.data.description;
        if (input.data.imageUrl !== undefined) updates.imageUrl = input.data.imageUrl;
        if (input.data.status !== undefined) updates.status = input.data.status;
        if (input.data.adoptionFee !== undefined)
          updates.adoptionFee = input.data.adoptionFee ? parseFloat(input.data.adoptionFee).toString() : null;

        await updatePet(input.id, updates);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const pet = await getPetById(input.id);
        if (!pet) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
        }
        await deletePet(input.id);
        return { success: true };
      }),
  }),

  // Adoption application endpoints
  applications: router({
    submit: protectedProcedure
      .input(adoptionApplicationSchema)
      .mutation(async ({ input, ctx }) => {
        // Validate pet exists
        const pet = await getPetById(input.petId);
        if (!pet) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pet not found" });
        }

        // Check if pet is available
        if (pet.status !== "available") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This pet is no longer available for adoption",
          });
        }

        // Create application
        const result = await createAdoptionApplication({
          userId: ctx.user.id,
          petId: input.petId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          homeType: input.homeType,
          hasYard: input.hasYard || false,
          otherPets: input.otherPets,
          experience: input.experience,
          reason: input.reason,
          status: "pending",
        });

        return result;
      }),

    myApplications: protectedProcedure.query(async ({ ctx }) => {
      const applications = await getApplicationsByUserId(ctx.user.id);
      return applications;
    }),

    allApplications: adminProcedure
      .input(
        z.object({
          status: z.enum(["pending", "approved", "rejected"]).optional(),
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(50).default(20),
        })
      )
      .query(async ({ input }) => {
        const offset = (input.page - 1) * input.limit;
        const result = await getAllApplications({
          status: input.status,
          limit: input.limit,
          offset,
        });

        return {
          applications: result.applications,
          total: result.total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(result.total / input.limit),
        };
      }),

    detail: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const application = await getApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        return application;
      }),

    approve: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const application = await getApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        await updateApplicationStatus(input.id, "approved", input.adminNotes);

        // Update pet status to adopted
        await updatePet(application.petId, { status: "adopted" });

        return { success: true };
      }),

    reject: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          adminNotes: z.string().min(1, "Rejection reason is required"),
        })
      )
      .mutation(async ({ input }) => {
        const application = await getApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        await updateApplicationStatus(input.id, "rejected", input.adminNotes);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
