// server/seed-pets.js
// Seeds the database with sample pets.
// Run from the server/ directory: node seed-pets.js
// Or from root:  npm run db:seed

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Check server/.env");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pets = [
  {
    "id": 1,
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "age": 24,
    "gender": "male",
    "description": "Buddy is a friendly and energetic Golden Retriever who loves to play fetch and cuddle. Great with kids and other dogs.",
    "imageUrl": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
    "status": "adopted",
    "adoptionFee": "15.00",
    "createdAt": "2026-04-12T08:15:22.316Z",
    "updatedAt": "2026-04-18T04:33:57.033Z"
  },
  {
    "id": 2,
    "name": "Luna",
    "species": "cat",
    "breed": "Siamese",
    "age": 18,
    "gender": "female",
    "description": "Luna is a graceful Siamese cat who loves attention and conversation. She will talk to you all day long!",
    "imageUrl": "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=500",
    "status": "pending",
    "adoptionFee": "100.00",
    "createdAt": "2026-04-12T08:15:22.329Z",
    "updatedAt": "2026-04-12T08:26:16.899Z"
  },
  {
    "id": 3,
    "name": "Max",
    "species": "dog",
    "breed": "German Shepherd",
    "age": 36,
    "gender": "male",
    "description": "Max is a loyal and intelligent German Shepherd. He's well trained and great for an active family.",
    "imageUrl": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500",
    "status": "adopted",
    "adoptionFee": "200.00",
    "createdAt": "2026-04-12T08:15:22.331Z",
    "updatedAt": "2026-04-12T08:15:22.331Z"
  },
  {
    "id": 4,
    "name": "Bella",
    "species": "dog",
    "breed": "Beagle",
    "age": 12,
    "gender": "female",
    "description": "Bella is a curious and playful Beagle puppy. She loves exploring and sniffing everything in sight.",
    "imageUrl": "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=500",
    "status": "pending",
    "adoptionFee": "175.00",
    "createdAt": "2026-04-12T08:15:22.333Z",
    "updatedAt": "2026-04-14T05:37:09.309Z"
  },
  {
    "id": 5,
    "name": "Oliver",
    "species": "cat",
    "breed": "Maine Coon",
    "age": 30,
    "gender": "male",
    "description": "Oliver is a majestic Maine Coon with a gentle giant personality. He loves lounging in sunny spots.",
    "imageUrl": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
    "status": "available",
    "adoptionFee": "125.00",
    "createdAt": "2026-04-12T08:15:22.336Z",
    "updatedAt": "2026-04-20T07:29:56.217Z"
  },
  {
    "id": 6,
    "name": "Daisy",
    "species": "rabbit",
    "breed": "Holland Lop",
    "age": 8,
    "gender": "female",
    "description": "Daisy is an adorable Holland Lop rabbit who loves to hop around and be hand-fed leafy greens.",
    "imageUrl": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500",
    "status": "available",
    "adoptionFee": "75.00",
    "createdAt": "2026-04-12T08:15:22.339Z",
    "updatedAt": "2026-04-12T08:15:22.339Z"
  },
  {
    "id": 7,
    "name": "Charlie",
    "species": "dog",
    "breed": "Labrador Retriever",
    "age": 48,
    "gender": "male",
    "description": "Charlie is a calm and loving four-year-old Lab. He is house-trained and does well in apartments.",
    "imageUrl": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500",
    "status": "adopted",
    "adoptionFee": "150.00",
    "createdAt": "2026-04-12T08:15:22.341Z",
    "updatedAt": "2026-04-12T08:15:22.341Z"
  },
  {
    "id": 8,
    "name": "Mittens",
    "species": "cat",
    "breed": "Domestic Shorthair",
    "age": 60,
    "gender": "female",
    "description": "Mittens is a sweet five-year-old cat who loves to cuddle on cold evenings. Perfect lap cat.",
    "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500",
    "status": "available",
    "adoptionFee": "80.00",
    "createdAt": "2026-04-12T08:15:22.344Z",
    "updatedAt": "2026-04-15T07:06:29.916Z"
  },
  {
    "id": 9,
    "name": "Rocky",
    "species": "dog",
    "breed": "Bulldog",
    "age": 24,
    "gender": "male",
    "description": "Rocky is a chill and lovable English Bulldog. Minimal exercise needs — great for apartment living.",
    "imageUrl": "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500",
    "status": "adopted",
    "adoptionFee": "250.00",
    "createdAt": "2026-04-12T08:15:22.346Z",
    "updatedAt": "2026-04-15T07:06:16.100Z"
  },
  {
    "id": 10,
    "name": "Whiskers",
    "species": "cat",
    "breed": "Persian",
    "age": 42,
    "gender": "male",
    "description": "Whiskers is a regal Persian cat who enjoys being groomed and pampered. Very calm and affectionate.",
    "imageUrl": "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
    "status": "available",
    "adoptionFee": "120.00",
    "createdAt": "2026-04-12T08:15:22.347Z",
    "updatedAt": "2026-04-15T07:29:10.740Z"
  },
  {
    "id": 12,
    "name": "Oliver",
    "species": "dog",
    "breed": "Beagle",
    "age": 5,
    "gender": "male",
    "description": "Oliver is a curious and energetic puppy with a fantastic sense of smell. He loves exploring the backyard and is very motivated by treats, making him a quick learner during training sessions. He is friendly with people and other pets, and he's looking for a home where he can get plenty of playtime and nose-work activities.",
    "imageUrl": "https://images.unsplash.com/photo-1552053831-71594a27632d",
    "status": "available",
    "adoptionFee": "650.00",
    "createdAt": "2026-04-15T12:50:30.960Z",
    "updatedAt": "2026-04-15T07:21:36.189Z"
  },
  {
    "id": 13,
    "name": "Luna",
    "species": "Cat",
    "breed": "Maine Coon",
    "age": 24,
    "gender": "female",
    "description": "Luna is a stunning \"dog-like\" feline who enjoys interactive play and following her owners from room to room. Known for her majestic fur and tufted ears, she is very vocal and will \"chirp\" to let you know she's ready for her favorite salmon treats.",
    "imageUrl": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
    "status": "available",
    "adoptionFee": "200.00",
    "createdAt": "2026-04-15T12:54:53.772Z",
    "updatedAt": "2026-04-15T12:54:53.772Z"
  }
]

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting pet seeding...\n");

    let inserted = 0;
    let skipped  = 0;

    for (const pet of pets) {
      // Skip if a pet with the same name + species already exists
      const { rows: existing } = await client.query(
        `SELECT id FROM pets WHERE name = $1 AND species = $2 LIMIT 1`,
        [pet.name, pet.species]
      );

      if (existing.length > 0) {
        console.log(`  ⏭  Skipped "${pet.name}" — already exists`);
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO pets
          (name, species, breed, age, gender, description, "imageUrl", status, "adoptionFee")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          pet.name,
          pet.species,
          pet.breed,
          pet.age,
          pet.gender,
          pet.description,
          pet.imageUrl,
          pet.status,
          pet.adoptionFee,
        ]
      );

      console.log(`  ✅ Inserted "${pet.name}" (${pet.species})`);
      inserted++;
    }

    console.log(`\n🎉 Seeding complete — ${inserted} inserted, ${skipped} skipped`);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();