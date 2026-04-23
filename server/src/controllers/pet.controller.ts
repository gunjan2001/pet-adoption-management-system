// server/controllers/pets.controller.ts
import { and, eq, ilike, SQL, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import db from '../config/db';
import { media, petMedia, pets } from '../db/schema';
import { generateImageUrl } from '../helpers/generateImageUrl';
import { PaginationInput, UpdatePetStatusInput } from '../validators/schemas';

// Helper function to get pet with images
async function getPetWithImages(petId: number) {
  // Get pet data
  const pet = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
  
  if (!pet || pet.length === 0) {
    return null;
  }

  // Get associated media
  const petImages = await db
    .select({
      id: media.id,
      url: media.checksum,
      sequence: petMedia.sequence,
    })
    .from(petMedia)
    .innerJoin(media, eq(petMedia.mediaId, media.id))
    .where(eq(petMedia.petId, petId))
    .orderBy(petMedia.sequence);

  return {
    ...pet[0],
    images: petImages?.map(img => ({
      id: img.id
    , url: generateImageUrl(img.url) || null,
      sequence: img.sequence,
    })) || [],
  };
}

// Get all pets with their images
export const getAllPets = async (req: Request<{}, {}, {}, PaginationInput>, res: Response) => {
  try {
    const { page = 1, limit = 10, status, species, gender, search, breed, minAge, maxAge } = req.query;

    const offset = (page - 1) * limit;

    const filters: SQL[] = [];
    if (status)  filters.push(eq(pets.status, status));
    if (gender)  filters.push(eq(pets.gender, gender));
    if (species) filters.push(ilike(pets.species, `%${species}%`));
    if (breed)   filters.push(ilike(pets.breed, `%${breed}%`));
    if (search)  filters.push(ilike(pets.name, `%${search}%`));
    if (minAge) filters.push(sql`${pets.age} >= ${minAge}`);
    if (maxAge) filters.push(sql`${pets.age} <= ${maxAge}`);
  
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(pets)
        .where(whereClause)
        .orderBy(pets.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pets)
        .where(whereClause),
    ]);

    // Get images for each pet
    const petsWithImages = await Promise.all(
      rows.map(async (pet) => {
        const petImages = await db
          .select({
            id: media.id,
            checksum: media.checksum,
            sequence: petMedia.sequence,
          })
          .from(petMedia)
          .innerJoin(media, eq(petMedia.mediaId, media.id))
          .where(eq(petMedia.petId, pet.id))
          .orderBy(petMedia.sequence);

        const imgUrl = generateImageUrl(petImages[0]?.checksum || null);

        return {
          ...pet,
              images: petImages?.map(img => ({
          id: img.id
        , url: generateImageUrl(img.checksum) || null,
        sequence: img.sequence,
        })) || [], // First image as main
          imageUrl: imgUrl || null, // First image as main (backward compatibility)
        };
      })
    );

    res.json({
      success: true,
      data: petsWithImages,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
};

// Get single pet with images
export const getPetById = async (req: Request, res: Response) => {
  try {
    const petId = parseInt(req.params.id);

    if (isNaN(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID' });
    }

    const petWithImages = await getPetWithImages(petId);

    if (!petWithImages) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Add imageUrl for backward compatibility
    const response = {
      success: true,
      data:{
      ...petWithImages,
      imageUrl: petWithImages.images[0]?.url || null,
    }};

    res.json(response);
  } catch (error) {
    console.error('Get pet by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
};

// Create new pet with images
export const createPet = async (req: Request, res: Response) => {
  try {
    const { name, species, breed, description, mediaIds, ...rest } = req.body;

    if (!name || !species) {
      return res.status(400).json({ error: 'Name and species are required' });
    }

    // Create pet
    const newPet = await db
      .insert(pets)
      .values({
        name,
        species,
        breed: breed || null,
        description: description || null,
        ...rest,
      })
      .returning();

    const petId = newPet[0].id;

    // Link media to pet (if mediaIds provided)
    if (mediaIds && Array.isArray(mediaIds) && mediaIds.length > 0) {
      const petMediaData = mediaIds.map((mediaId: number, index: number) => ({
        petId,
        mediaId,
        sequence: index, // Order based on array position
      }));

      await db.insert(petMedia).values(petMediaData);
    }

    // Fetch and return pet with images
    const petWithImages = await getPetWithImages(petId);
    res.status(201).json(petWithImages);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Failed to create pet' });
  }
};

// Update pet and its images
export const updatePet = async (req: Request, res: Response) => {
  try {
    const petId = parseInt(req.params.id);
    const { mediaIds, ...updateData } = req.body;   

    if (isNaN(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID' });
    }

    // Update pet data
    const updated = await db
      .update(pets)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(pets.id, petId))
      .returning();
    
      console.log("updated",updated);
      
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    // Update media associations if mediaIds provided
    if (mediaIds !== undefined && Array.isArray(mediaIds)) {
      // Delete existing associations
      await db.delete(petMedia).where(eq(petMedia.petId, petId));

      // Create new associations
      if (mediaIds.length > 0) {
        const petMediaData = mediaIds.map((mediaId: number, index: number) => ({
          petId,
          mediaId,
          sequence: index,
        }));

        await db.insert(petMedia).values(petMediaData);
      }
    }

    // Fetch and return updated pet with images
    const petWithImages = await getPetWithImages(petId);
    res.json(petWithImages);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
};

export const updatePetStatus = async (
  req: Request<{ id: string }, {}, UpdatePetStatusInput>,
  res: Response
): Promise<void> => {
  try {
    const petId = parseInt(req.params.id, 10);
    if (isNaN(petId)) {
      res.status(400).json({ success: false, message: "Invalid pet ID" });
      return;
    }

    const [updated] = await db
      .update(pets)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(pets.id, petId))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, message: "Pet not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Pet status updated", data: updated });
  } catch (error) {
    console.error("Update pet status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete pet (cascade will delete pet_media entries)
export const deletePet = async (req: Request, res: Response) => {
  try {
    const petId = parseInt(req.params.id);

    if (isNaN(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID' });
    }

    const deleted = await db
      .delete(pets)
      .where(eq(pets.id, petId))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
};

// Get images for a specific pet
// export const getPetImages = async (req: Request, res: Response) => {
//   try {
//     const petId = parseInt(req.params.id);

//     if (isNaN(petId)) {
//       return res.status(400).json({ error: 'Invalid pet ID' });
//     }

//     const images = await db
//       .select({
//         id: media.id,
//         url: media.checksum,
//         sequence: petMedia.sequence,
//       })
//       .from(petMedia)
//       .innerJoin(media, eq(petMedia.mediaId, media.id))
//       .where(eq(petMedia.petId, petId))
//       .orderBy(petMedia.sequence);

//     res.json(images);
//   } catch (error) {
//     console.error('Get pet images error:', error);
//     res.status(500).json({ error: 'Failed to fetch pet images' });
//   }
// };