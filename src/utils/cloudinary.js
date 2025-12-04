import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; // Use promise-based fs

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads an image to Cloudinary and deletes the local file.
 * @param {string} localFilePath - Path to the local image file.
 * @returns {Promise<{url: string}>} - The uploaded image URL.
 */
export const uploadToCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        // Check if file exists
        await fs.access(localFilePath);

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: "users" // optional: store all uploads in a folder
        });

        // Delete local file after upload
        await fs.unlink(localFilePath);

        console.log("[Cloudinary] Uploaded:", result.secure_url);
        return { url: result.secure_url };

    } catch (error) {
        console.error("[Cloudinary] Upload error:", error);

        // Attempt to delete local file even if upload failed
        try {
            await fs.unlink(localFilePath);
        } catch (_) {
            // Ignore error if file doesn't exist
        }

        throw new Error("Cloudinary upload failed: " + error.message);
    }
};
