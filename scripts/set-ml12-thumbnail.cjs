/**
 * Point Machine Learning Unit 1 & 2 thumbnailSrc at the ML cover asset.
 * Usage: node scripts/set-ml12-thumbnail.cjs
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

const THUMB =
  "https://notes-era.vercel.app/Assets2/Premium-Modules/Modules/ML12/thumbnail.jpeg";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 45000,
    family: 4,
  });
  await client.connect();
  const col = client.db().collection("modules");

  const filter = {
    $or: [
      { slug: "Machine Learning Unit(1 & 2) Detailed" },
      { name: /Machine Learning Unit\(1\s*&\s*2\)/i },
      { thumbnailSrc: /Modules\/ML12\/thumbnail/i },
    ],
  };

  const docs = await col.find(filter).toArray();
  console.log(
    "Matched:",
    docs.map((d) => ({ slug: d.slug, name: d.name, thumb: d.thumbnailSrc })),
  );

  const result = await col.updateMany(filter, {
    $set: { thumbnailSrc: THUMB },
  });
  console.log("Updated:", result.modifiedCount);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
