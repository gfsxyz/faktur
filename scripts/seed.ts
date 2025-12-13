import { db } from "../lib/db";
import { clients, invoices, invoiceItems, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

// Configuration
const USER_EMAIL = "kataliskstudio@gmail.com";
const NUM_CLIENTS = 1000;
const NUM_INVOICES = 15000;

// Sample data pools for realistic generation
const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emma",
  "Robert",
  "Lisa",
  "William",
  "Emily",
  "James",
  "Jessica",
  "Daniel",
  "Ashley",
  "Christopher",
  "Amanda",
  "Matthew",
  "Stephanie",
  "Joshua",
  "Jennifer",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
];

const companyNames = [
  "Tech Solutions Inc",
  "Global Consulting Group",
  "Digital Marketing Pro",
  "Creative Design Studio",
  "Enterprise Software Ltd",
  "Cloud Services Corp",
  "Data Analytics Co",
  "Web Development Agency",
  "Mobile Apps Studio",
  "E-Commerce Solutions",
  "Content Strategy Group",
  "SEO Experts Inc",
  "Social Media Masters",
  "Video Production House",
  "Graphic Design Co",
  "Branding Agency",
  "IT Consulting Firm",
  "Cybersecurity Solutions",
  "AI Research Lab",
  "Blockchain Ventures",
];

const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "San Francisco",
  "Charlotte",
  "Indianapolis",
  "Seattle",
  "Denver",
  "Boston",
];

const states = [
  "NY",
  "CA",
  "IL",
  "TX",
  "AZ",
  "PA",
  "FL",
  "OH",
  "WA",
  "CO",
  "MA",
];

const serviceDescriptions = [
  "Web Design & Development",
  "Logo & Brand Identity",
  "SEO Optimization",
  "Content Writing",
  "Social Media Management",
  "Email Marketing Campaign",
  "Mobile App Development",
  "UI/UX Design",
  "E-commerce Setup",
  "Server Maintenance",
  "Cloud Migration",
  "Database Optimization",
  "Security Audit",
  "API Integration",
  "Custom Software Development",
  "Consulting Services",
  "Project Management",
  "Technical Support",
  "Training & Workshops",
  "Data Analysis",
];

const invoiceStatuses = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

// Helper functions
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com"];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(
    domains
  )}`;
}

function generatePhone(): string {
  return `+1-${randomNumber(200, 999)}-${randomNumber(200, 999)}-${randomNumber(
    1000,
    9999
  )}`;
}

function generatePostalCode(): string {
  return String(randomNumber(10000, 99999));
}

function generateInvoiceNumber(index: number): string {
  return `INV-${String(index + 1).padStart(5, "0")}`;
}

async function main() {
  console.log("🌱 Starting seed process...\n");

  // 1. Get user ID
  console.log(`📧 Looking for user with email: ${USER_EMAIL}`);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, USER_EMAIL))
    .limit(1);

  if (!user) {
    console.error(`❌ User with email ${USER_EMAIL} not found!`);
    console.error("Please make sure you're logged in and have an account.");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (ID: ${user.id})\n`);

  // 2. Generate clients
  console.log(`👥 Generating ${NUM_CLIENTS} clients...`);
  const clientData = [];

  for (let i = 0; i < NUM_CLIENTS; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const city = randomElement(cities);
    const state = randomElement(states);

    clientData.push({
      userId: user.id,
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      company: randomElement(companyNames),
      address: `${randomNumber(100, 9999)} ${randomElement([
        "Main",
        "Oak",
        "Maple",
        "Park",
        "Elm",
      ])} St`,
      city,
      state,
      country: "USA",
      postalCode: generatePostalCode(),
      taxId: `TAX-${randomNumber(100000, 999999)}`,
      notes: Math.random() > 0.7 ? "VIP Client - High Priority" : undefined,
    });
  }

  const insertedClients = await db
    .insert(clients)
    .values(clientData)
    .returning();
  console.log(`✅ Created ${insertedClients.length} clients\n`);

  // 3. Generate invoices
  console.log(`📄 Generating ${NUM_INVOICES} invoices with items...`);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const today = new Date();

  let invoiceCount = 0;
  let itemCount = 0;

  for (let i = 0; i < NUM_INVOICES; i++) {
    const client = randomElement(insertedClients);
    const status = randomElement(
      invoiceStatuses
    ) as (typeof invoiceStatuses)[number];
    const issueDate = randomDate(oneYearAgo, today);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + randomNumber(15, 45));

    // Generate 2-5 items for this invoice
    const numItems = randomNumber(2, 5);
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const quantity = randomNumber(1, 10);
      const rate = randomFloat(50, 500);
      const amount = quantity * rate;

      items.push({
        description: randomElement(serviceDescriptions),
        quantity,
        rate,
        amount,
        order: j,
      });

      subtotal += amount;
    }

    // Calculate totals
    const taxRate = randomFloat(0, 15);
    const taxAmount = (subtotal * taxRate) / 100;

    const hasDiscount = Math.random() > 0.7;
    const discountType = hasDiscount
      ? (randomElement(["percentage", "fixed"]) as "percentage" | "fixed")
      : "none";
    const discountValue = hasDiscount
      ? discountType === "percentage"
        ? randomFloat(5, 20)
        : randomFloat(50, 200)
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
        ? randomFloat(0, total * 0.5)
        : 0;

    // Insert invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        userId: user.id,
        clientId: client.id,
        invoiceNumber: generateInvoiceNumber(i),
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
        notes:
          Math.random() > 0.8
            ? "Please include reference number in payment"
            : undefined,
        terms:
          "Payment is due within 30 days. Late payments may incur additional fees.",
      })
      .returning();

    // Insert invoice items
    const itemsData = items.map((item) => ({
      invoiceId: invoice.id,
      ...item,
    }));

    await db.insert(invoiceItems).values(itemsData);

    invoiceCount++;
    itemCount += items.length;

    if ((i + 1) % 20 === 0) {
      console.log(
        `  ⏳ Progress: ${i + 1}/${NUM_INVOICES} invoices created...`
      );
    }
  }

  console.log(
    `✅ Created ${invoiceCount} invoices with ${itemCount} total items\n`
  );

  // 4. Summary
  console.log("📊 Seed Summary:");
  console.log(`   • Clients: ${insertedClients.length}`);
  console.log(`   • Invoices: ${invoiceCount}`);
  console.log(`   • Invoice Items: ${itemCount}`);
  console.log(`   • Status Distribution:`);

  for (const status of invoiceStatuses) {
    const count = await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, status));
    console.log(`     - ${status}: ${count.length}`);
  }

  console.log("\n✨ Seeding completed successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
