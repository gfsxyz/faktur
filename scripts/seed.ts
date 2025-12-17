import { faker } from "@faker-js/faker";
import { db } from "../lib/db";
import { clients, invoices, invoiceItems, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

// ============================
// Configuration
// ============================
const USER_EMAIL = "test@gmail.com";
const NUM_CLIENTS = 367;
const NUM_INVOICES = 1677;

const INVOICE_STATUS_WEIGHTS = [
  { value: "paid", weight: 47 },
  { value: "sent", weight: 23 },
  { value: "overdue", weight: 12 },
  { value: "draft", weight: 4 },
  { value: "cancelled", weight: 5 },
] as const;

// ============================
// Notes & Terms Pools
// ============================
const CLIENT_NOTES = [
  "VIP client with high monthly billing volume",
  "Prefers communication via email only",
  "Requires signed purchase order before invoicing",
  "International client with special tax handling",
  "Often requests invoice revisions",
  "Long-term client with recurring projects",
  "Priority support enabled for this account",
  "Payment history shows occasional delays",
  "Dedicated account manager assigned",
  "Invoices must reference internal project code",
  "Requires approval from finance department",
  "Client prefers invoices sent at month end",
  "Sensitive client, confirm details before billing",
  "Bulk services billed quarterly",
  "Multiple stakeholders involved in approval",
  "Invoices must be split by department",
  "Client operates in multiple countries",
  "Early payment discounts occasionally applied",
  "Strict compliance and audit requirements",
  "Client prefers detailed line item descriptions",
  "High-value enterprise customer",
  "Requires custom payment schedule",
];

const INVOICE_TERMS = [
  "Payment due within 30 days from issue date",
  "Late payments may incur additional fees",
  "Bank transfer only, no cash payments accepted",
  "Full payment required before service delivery",
  "Net 15 payment terms apply",
  "Payment must reference invoice number",
  "Partial payments are not accepted",
  "All prices exclude applicable taxes",
  "Disputes must be raised within 7 days",
  "Services rendered are non-refundable",
  "Payment confirmation required via email",
  "Overdue invoices may result in service suspension",
];

// ============================
// Seed Script
// ============================
async function main() {
  console.log("🌱 Starting seed process...\n");

  // 1. Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, USER_EMAIL))
    .limit(1);

  if (!user) {
    console.error(`❌ User with email ${USER_EMAIL} not found`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (ID: ${user.id})\n`);

  // ============================
  // 2. Clients
  // ============================
  console.log(`👥 Generating ${NUM_CLIENTS} clients...`);

  const clientData = Array.from({ length: NUM_CLIENTS }).map(() => ({
    userId: user.id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "international" }),
    company: faker.company.name(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    postalCode: faker.location.zipCode(),
    taxId: `TAX-${faker.number.int({ min: 100000, max: 999999 })}`,
    notes: faker.helpers.maybe(() => faker.helpers.arrayElement(CLIENT_NOTES), {
      probability: 0.25,
    }),
  }));

  const insertedClients = await db
    .insert(clients)
    .values(clientData)
    .returning();

  console.log(`✅ Created ${insertedClients.length} clients\n`);

  // ============================
  // 3. Invoices + Items
  // ============================
  console.log(`📄 Generating ${NUM_INVOICES} invoices with items...`);

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  let invoiceCount = 0;
  let itemCount = 0;

  for (let i = 0; i < NUM_INVOICES; i++) {
    const client = faker.helpers.arrayElement(insertedClients);
    const status = faker.helpers.weightedArrayElement(INVOICE_STATUS_WEIGHTS);

    const issueDate = faker.date.between({
      from: oneYearAgo,
      to: today,
    });

    const dueDate = faker.date.soon({
      days: faker.number.int({ min: 15, max: 45 }),
      refDate: issueDate,
    });

    const numItems = faker.number.int({ min: 2, max: 5 });
    let subtotal = 0;

    const items = Array.from({ length: numItems }).map((_, index) => {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const rate = faker.number.float({
        min: 50,
        max: 500,
        fractionDigits: 2,
      });

      const amount = quantity * rate;
      subtotal += amount;

      return {
        description: faker.commerce.productName(),
        quantity,
        rate,
        amount,
        order: index,
      };
    });

    const taxRate = faker.number.float({
      min: 0,
      max: 15,
      fractionDigits: 2,
    });

    const taxAmount = (subtotal * taxRate) / 100;

    const hasDiscount = faker.datatype.boolean({ probability: 0.3 });
    const discountType = hasDiscount
      ? faker.helpers.arrayElement(["percentage", "fixed"])
      : "none";

    const discountValue = hasDiscount
      ? discountType === "percentage"
        ? faker.number.float({ min: 5, max: 20, fractionDigits: 2 })
        : faker.number.float({ min: 50, max: 200, fractionDigits: 2 })
      : 0;

    const discountAmount = hasDiscount
      ? discountType === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue
      : 0;

    const total = subtotal + taxAmount - discountAmount;

    const amountPaid =
      status === "paid"
        ? total
        : status === "overdue"
        ? faker.number.float({
            min: 0,
            max: total * 0.5,
            fractionDigits: 2,
          })
        : 0;

    const [invoice] = await db
      .insert(invoices)
      .values({
        userId: user.id,
        clientId: client.id,
        invoiceNumber: `INV-${String(i + 1).padStart(5, "0")}`,
        status,
        issueDate,
        dueDate,
        subtotal,
        taxRate,
        taxAmount,
        discountType,
        discountValue,
        discountAmount,
        total,
        amountPaid,
        notes: faker.helpers.maybe(
          () => faker.helpers.arrayElement(CLIENT_NOTES),
          { probability: 0.2 }
        ),
        terms: faker.helpers.maybe(
          () => faker.helpers.arrayElement(INVOICE_TERMS),
          { probability: 0.15 }
        ),
      })
      .returning();

    await db.insert(invoiceItems).values(
      items.map((item) => ({
        invoiceId: invoice.id,
        ...item,
      }))
    );

    invoiceCount++;
    itemCount += items.length;

    if ((i + 1) % 20 === 0) {
      console.log(`  ⏳ Progress: ${i + 1}/${NUM_INVOICES}`);
    }
  }

  // ============================
  // Summary
  // ============================
  console.log("\n📊 Seed Summary:");
  console.log(`   • Clients: ${insertedClients.length}`);
  console.log(`   • Invoices: ${invoiceCount}`);
  console.log(`   • Invoice Items: ${itemCount}`);

  console.log("\n✨ Seeding completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
