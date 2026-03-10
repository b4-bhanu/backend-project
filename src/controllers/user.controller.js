import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// User must be imported like this since it was not a defualt export,but a Named Export. We would not need {} and we could name the User to anything else, in case of a default export.

//Postman => It lets you send HTTP requests to your backend without needing a frontend.
// Used mainly for testing backend APIs during development. 
// POST /api/users/register ← API and POST/register is the API endpoint.


// asyncHandler is a Wrapper. it wraps async functions so that we dont have to apply try,catch each time.
const registerUser = asyncHandler( async(req,res) => {
    // get user details from frontend
    // validation => see if user details are all there, in the correct format.
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - create entry in db(.create)
    // remove password and refresh token field from response
    // check for user creation => see if actually user is created or there is a null response
    // return response

    // getting details
    
    const {fullName,username,email,password} = req.body;
    /*
    req.body contains data sent in the request body by the client (usually from a form or JSON).
    {
     fullName: 'bhanuSingh',
     username: 'b4_bhanu',
     email: 'bb2@gmail.com',
     password: 'bb123'
    }

    req.body  → text fields
    req.files → uploaded files
    */
    // console.log(req.body);
    // console.log("email", email)
    
    //validation
    /*
    you could write similarly for remaining form data, one by one.
    if(fullName === ""){
        throw new ApiError(400,"fullname is required")
    }
    */

    if(
        [fullName,email,username,password].some((field) => !field || field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required");
    }

    if(!email || !email.includes("@")){
        throw new ApiError(400,"email must have an @ sign")
    }

    // check is user already exists

    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"username or email already exists")
    }

    //check for images or avatar

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    /*
    avatar → array
    avatar[0] → first file object
    avatar[0].fieldname → "avatar"
   */
    // req.files comes from Multer. It contains info about uploaded files.
    // console.log(req.files); // at the end
    // console.log(req.files.avatar[0]); // to print the full object including path
    // here, the name avatar is generic, it could have been anything else.
    // req.body is available by default from express, multer gives us access to req.files
    // localPath because its currently on our server, and has not been sent to cloudinary

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // without chaining
    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object, create entry in db
    // only User of all imported files is communicating to the db, and it will be so most of the time.
    
    // we are using await since we are communicating with db.
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //  we check if coverImage has been provided by user or not, similarly as avatar that we did previously.
        email,
        password,
        username: username.toLowerCase(), 
   })
   
   // remove password and refresh toke

   // we write elements we dont want in our select method here, using a '-' sign.
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   // check if user is created
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user");
   }

   
   // this would have been fine
   //    return res.status(201).json({createdUser}) 

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )

   
})

export {registerUser};



/*
console.log(req.files)
req.files is usually an object containing arrays of file objects.
[Object: null prototype] {
  avatar: [
    {
      fieldname: 'avatar',
      originalname: 'sidPhoto.jpeg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: 'sidPhoto.jpeg',
    }
  ]
}
  // there is no explicit key named "Path", but we can access it since Path = destination + fileName
// there is no coverImage here, since i did not send it from postman.
*/

 





