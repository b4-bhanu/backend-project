import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


// designing our own middleware.
// middleware runs only when you attach it to a route.
export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }
    
        // jwt might sometimes require await, but works fine without it normally.
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        //In decodedToken?._id, this id is actually one you sent in generateAccessToken method in "user model", so that's  how we are finding the id here.
        const user = await User.findById(decodedToken?._id).select("-password - refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
    
})