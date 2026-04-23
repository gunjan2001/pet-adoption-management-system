export const generateImageUrl = (checksum: string | null): string | null => {
  if (!checksum) return null;
  return `${process.env.CLOUDINARY_ENDPOINT}/${checksum}`;
};