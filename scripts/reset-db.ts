import { db } from "../lib/db";
import { invoiceItems, invoices, clients } from "../lib/db/schema";

async function resetDatabase() {
  console.log("🗑️  Clearing database...\n");

  try {
    // Delete in correct order (foreign key constraints)
    console.log("  ⏳ Deleting invoice items...");
    await db.delete(invoiceItems);
    console.log("  ✅ Invoice items deleted");

    console.log("  ⏳ Deleting invoices...");
    await db.delete(invoices);
    console.log("  ✅ Invoices deleted");

    console.log("  ⏳ Deleting clients...");
    await db.delete(clients);
    console.log("  ✅ Clients deleted");

    console.log("\n✨ Database cleared successfully!");
    console.log("You can now run 'npm run db:seed' to populate with new data.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

resetDatabase();
