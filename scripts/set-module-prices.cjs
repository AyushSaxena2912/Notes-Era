/**
 * Set module offer/MRP prices from the Notes-Era pack table:
 *   Units 1–2 / 3–4 / Unit 5  → offer ₹19, MRP ₹29
 *   All 5 Units               → offer ₹49, MRP ₹57
 *
 * Usage: node scripts/set-module-prices.cjs
 * Dry run:  DRY_RUN=1 node scripts/set-module-prices.cjs
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

const UNIT_PACK = { softCopyPrice: 19, mrp: 29 };
const ALL_FIVE = { softCopyPrice: 49, mrp: 57 };

function classify(name = "", slug = "") {
  const t = `${name} ${slug}`.toLowerCase().replace(/\s+/g, " ");
  if (/1\s*to\s*5|1to5|1\s*[-–]\s*5|unit\s*1\s*to\s*5|all\s*5/.test(t)) {
    return "all5";
  }
  return "unitPack";
}

async function main() {
  const dryRun = process.env.DRY_RUN === "1";
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }

  console.log("Connecting to Mongo...");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 45000,
    family: 4,
  });

  await client.connect();
  const db = client.db();
  console.log("Connected db:", db.databaseName);

  const col = db.collection("modules");
  const mods = await col.find({}).toArray();
  console.log("Modules found:", mods.length);

  let updated = 0;
  for (const m of mods) {
    const kind = classify(m.name, m.slug);
    const prices = kind === "all5" ? ALL_FIVE : UNIT_PACK;
    console.log(
      `${kind.padEnd(8)} ₹${prices.softCopyPrice} (MRP ₹${prices.mrp})  ${m.slug || m.name}`,
    );
    if (!dryRun) {
      await col.updateOne(
        { _id: m._id },
        { $set: { softCopyPrice: prices.softCopyPrice, mrp: prices.mrp } },
      );
      updated += 1;
    }
  }

  console.log(
    dryRun
      ? `\nDry run — ${mods.length} modules classified (no writes).`
      : `\nUpdated ${updated} modules.`,
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
