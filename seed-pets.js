#!/usr/bin/env node

import 'dotenv/config';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database...');

const client = postgres(DATABASE_URL);

const testPets = [
  {
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 24, // 2 years in months
    gender: 'male',
    description: 'A friendly and energetic golden retriever who loves to play fetch and swim. Perfect for active families.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'available',
    adoptionFee: '150.00'
  },
  {
    name: 'Bella',
    species: 'dog',
    breed: 'Labrador',
    age: 36, // 3 years in months
    gender: 'female',
    description: 'Sweet and gentle Labrador with a calm temperament. Great with kids and other pets.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'available',
    adoptionFee: '120.00'
  },
  {
    name: 'Charlie',
    species: 'dog',
    breed: 'Beagle',
    age: 18, // 1.5 years in months
    gender: 'male',
    description: 'Curious and playful beagle with lots of energy. Needs an active family.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'available',
    adoptionFee: '100.00'
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age: 24, // 2 years in months
    gender: 'female',
    description: 'Beautiful Persian cat with a silky coat. Loves cuddling and being pampered.',
    imageUrl: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
    status: 'available',
    adoptionFee: '80.00'
  },
  {
    name: 'Oliver',
    species: 'cat',
    breed: 'Maine Coon',
    age: 12, // 1 year in months
    gender: 'male',
    description: 'Playful Maine Coon kitten with a big personality. Great for families.',
    imageUrl: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
    status: 'available',
    adoptionFee: '100.00'
  },
  {
    name: 'Mittens',
    species: 'cat',
    breed: 'Tabby',
    age: 60, // 5 years in months
    gender: 'female',
    description: 'Calm and affectionate tabby cat. Perfect for a peaceful home.',
    imageUrl: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
    status: 'available',
    adoptionFee: '60.00'
  },
  {
    name: 'Buddy',
    species: 'dog',
    breed: 'Mixed',
    age: 48, // 4 years in months
    gender: 'male',
    description: 'Friendly mixed breed dog with a great temperament. Gets along well with everyone.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'pending',
    adoptionFee: '90.00'
  },
  {
    name: 'Sophie',
    species: 'rabbit',
    breed: 'Holland Lop',
    age: 6, // 6 months in months
    gender: 'female',
    description: 'Adorable Holland Lop rabbit. Great for families with kids.',
    imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b3f4?w=400',
    status: 'available',
    adoptionFee: '40.00'
  },
  {
    name: 'Daisy',
    species: 'dog',
    breed: 'Poodle',
    age: 30, // 2.5 years in months
    gender: 'female',
    description: 'Intelligent and hypoallergenic poodle. Well-trained and obedient.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'available',
    adoptionFee: '180.00'
  },
  {
    name: 'Rocky',
    species: 'dog',
    breed: 'German Shepherd',
    age: 42, // 3.5 years in months
    gender: 'male',
    description: 'Strong and loyal German Shepherd. Good for experienced dog owners.',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cda119?w=400',
    status: 'available',
    adoptionFee: '200.00'
  }
];

(async () => {
  try {
    console.log(`Adding ${testPets.length} test pets to the database...`);

    for (const pet of testPets) {
      const result = await client`
        INSERT INTO pets (name, species, breed, age, gender, description, "imageUrl", status, "adoptionFee", "createdAt", "updatedAt")
        VALUES (
          ${pet.name},
          ${pet.species},
          ${pet.breed || null},
          ${pet.age},
          ${pet.gender || 'unknown'},
          ${pet.description || null},
          ${pet.imageUrl || null},
          ${pet.status || 'available'},
          ${pet.adoptionFee || null},
          NOW(),
          NOW()
        )
        RETURNING id, name, species;
      `;
      
      console.log(`✓ Added: ${pet.name} (${pet.species}) - ID: ${result[0].id}`);
    }

    console.log(`\n✅ Successfully added ${testPets.length} test pets!`);
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test pets:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
