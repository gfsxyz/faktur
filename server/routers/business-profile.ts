import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const businessProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
});

export const businessProfileRouter = createTRPCRouter({
  // Get the user's business profile
  get: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, ctx.userId))
      .limit(1);

    return profile || null;
  }),

  // Create or update business profile
  upsert: protectedProcedure
    .input(businessProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.userId, ctx.userId))
        .limit(1);

      if (existingProfile) {
        // Update existing profile
        const [updated] = await db
          .update(businessProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(businessProfiles.userId, ctx.userId))
          .returning();

        return updated;
      } else {
        // Create new profile
        const [created] = await db
          .insert(businessProfiles)
          .values({
            ...input,
            userId: ctx.userId,
          })
          .returning();

        return created;
      }
    }),

  // Upload logo (base64)
  uploadLogo: protectedProcedure
    .input(z.object({ logo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.userId, ctx.userId))
        .limit(1);

      if (existingProfile) {
        // Update logo
        const [updated] = await db
          .update(businessProfiles)
          .set({
            logo: input.logo,
            updatedAt: new Date(),
          })
          .where(eq(businessProfiles.userId, ctx.userId))
          .returning();

        return updated;
      } else {
        throw new Error("Business profile not found. Please create a profile first.");
      }
    }),

  // Delete logo
  deleteLogo: protectedProcedure.mutation(async ({ ctx }) => {
    const [updated] = await db
      .update(businessProfiles)
      .set({
        logo: null,
        updatedAt: new Date(),
      })
      .where(eq(businessProfiles.userId, ctx.userId))
      .returning();

    return updated;
  }),
});
