import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const CLOUDINARY_CLOUD = 'dfwusklvk';
const CLOUDINARY_PRESET = 'portfolio_unsigned';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

/**
 * Uploads a file or a remote URL to Cloudinary
 * @param {File | string} fileOrUrl - The file object or remote URL string
 * @returns {Promise<string>} The secure Cloudinary URL
 */
export const uploadToCloudinary = async (fileOrUrl) => {
  const formData = new FormData();
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('file', fileOrUrl); // Cloudinary accepts file objects or URL strings

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Cloudinary upload failed: ' + err);
  }

  const data = await res.json();
  const imageUrl = data.secure_url;

  // Save to Firestore media library
  try {
    await addDoc(collection(db, 'mediaLibrary'), {
      url: imageUrl,
      publicId: data.public_id,
      storage: 'cloudinary',
      createdAt: serverTimestamp(),
      type: data.resource_type || 'image',
      format: data.format || 'unknown'
    });
  } catch (err) {
    console.error('Failed to save to mediaLibrary in Firestore', err);
    // Continue even if Firestore fails, return the image URL
  }

  return imageUrl;
};
