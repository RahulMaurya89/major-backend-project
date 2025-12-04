import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // 1. Validate required fields
    if ([fullName, email, username, password].some(f => !f || f.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 2. Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with given email or username already exists");
    }

    // 3. Get file paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if (req.files?.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // 4. Upload avatar to Cloudinary
    let avatarUrl;
    try {
        const avatar = await uploadToCloudinary(avatarLocalPath);
        if (!avatar?.url) throw new Error("Avatar upload failed");
        avatarUrl = avatar.url;
    } catch (err) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // 5. Upload cover image (optional)
    let coverImageUrl = "";
    if (coverImageLocalPath) {
        try {
            const cover = await uploadToCloudinary(coverImageLocalPath);
            coverImageUrl = cover?.url || "";
        } catch (err) {
            console.warn("Cover image upload failed, skipping...");
        }
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create user in database
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password: hashedPassword,
        avatar: avatarUrl,
        coverImage: coverImageUrl
    });

    // 8. Return created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});

export { registerUser };



// get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response