import { v2 as cloudinart } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLUDINARY_CLOUD_NAME,
    api_key: process.env.CLUDINARY_API_KEY,
    api_secret: process.env.CLUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        // Upload the image to Cloudinary
        const response =await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("file uploaded to Cloudinary successfully", response.url);
        return response;
    }catch (error){

        fs.unlinkSync(localFilePath); // delete the local file in case of error
        return null;

    }
}

export { uploadToCloudinary };