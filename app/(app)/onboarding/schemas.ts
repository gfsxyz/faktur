import { z } from "zod";

// Step 1: Company Info (required)
export const step1Schema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Business email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .toLowerCase()
    .transform((val) => val.trim()),
});

// Step 3: Contact (optional)
export const step3Schema = z.object({
  phone: z
    .string()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Phone number invalid"
    )
    .refine(
      (val) => !val || val.length >= 7,
      "Phone number must be at least 7 characters"
    )
    .refine((val) => !val || val.length <= 20, "Phone number too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
          val
        ),
      "Please enter a valid website URL (e.g., https://company.com)"
    )
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
});

// Step 4: Address (optional)
export const step4Schema = z.object({
  address: z
    .string()
    .refine((val) => !val || val.length <= 500, "Address too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "City can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => !val || val.length <= 100, "City name too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .refine((val) => !val || val.length <= 100, "State/Province too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "Country can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => !val || val.length <= 100, "Country name too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .refine(
      (val) => !val || /^[A-Z0-9\s\-]+$/i.test(val),
      "Postal code can only contain letters, numbers, spaces, and hyphens"
    )
    .refine((val) => !val || val.length <= 20, "Postal code too long")
    .transform((val) => val.trim())
    .optional()
    .or(z.literal("")),
});

export type OnboardingData = {
  // Step 1
  companyName: string;
  email: string;
  // Step 2
  logo?: string;
  // Step 3
  phone?: string;
  website?: string;
  // Step 4
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};
