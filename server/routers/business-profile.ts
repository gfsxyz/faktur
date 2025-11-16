import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const businessProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters long")
    .max(200, "Company name must not exceed 200 characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Business email address is required")
    .email("Please enter a valid email address (e.g., info@company.com)")
    .max(255, "Email address must not exceed 255 characters")
    .toLowerCase()
    .transform((val) => val.trim()),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses"
    )
    .refine(
      (val) => !val || val.length >= 7,
      "Phone number must be at least 7 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Phone number must not exceed 20 characters"
    )
    .transform((val) => val?.trim() || ""),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 500,
      "Address must not exceed 500 characters"
    )
    .transform((val) => val?.trim() || ""),
  city: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "City can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "City name must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  state: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 100,
      "State/Province must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  country: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "Country can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "Country name must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9\s\-]+$/i.test(val),
      "Postal code can only contain letters, numbers, spaces, and hyphens"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Postal code must not exceed 20 characters"
    )
    .transform((val) => val?.trim() || ""),
  taxId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 5,
      "Tax ID / EIN must be at least 5 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 50,
      "Tax ID / EIN must not exceed 50 characters"
    )
    .transform((val) => val?.trim() || ""),
  vatNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9]+$/i.test(val),
      "VAT number can only contain letters and numbers"
    )
    .refine(
      (val) => !val || val.length >= 8,
      "VAT number must be at least 8 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 15,
      "VAT number must not exceed 15 characters"
    )
    .transform((val) => val?.trim().toUpperCase() || ""),
  logo: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
          val
        ),
      "Please enter a valid website URL (e.g., https://company.com)"
    )
    .transform((val) => val?.trim() || ""),
  bankName: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 200,
      "Bank name must not exceed 200 characters"
    )
    .transform((val) => val?.trim() || ""),
  bankAccountNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9]+$/i.test(val),
      "Account number can only contain letters and numbers"
    )
    .refine(
      (val) => !val || val.length >= 6,
      "Account number must be at least 6 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 34,
      "Account number must not exceed 34 characters"
    )
    .transform((val) => val?.trim() || ""),
  bankRoutingNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]+$/.test(val),
      "Routing number must contain only digits"
    )
    .refine(
      (val) => !val || val.length === 9,
      "Routing number must be exactly 9 digits"
    )
    .transform((val) => val?.trim() || ""),
  swiftCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(val),
      "SWIFT code must be 8 or 11 characters (e.g., BOFAUS3N)"
    )
    .transform((val) => val?.trim().toUpperCase() || ""),
  iban: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i.test(val),
      "IBAN must start with 2 letters followed by 2 digits (e.g., GB29NWBK60161331926819)"
    )
    .refine(
      (val) => !val || val.length >= 15,
      "IBAN must be at least 15 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 34,
      "IBAN must not exceed 34 characters"
    )
    .transform((val) => val?.trim().replace(/\s/g, "").toUpperCase() || ""),
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
        // Create a new profile with minimal required fields and logo
        const [created] = await db
          .insert(businessProfiles)
          .values({
            userId: ctx.userId,
            companyName: "My Company",
            email: ctx.session?.user?.email || "info@company.com",
            logo: input.logo,
          })
          .returning();

        return created;
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
