import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


// here we don't use asyncHandler Wrapper because we are not handling a web request, this is an internal task.
const generateAccessAndRefreshTokens = async(useId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //we save refresh token to avoid needing password again and again.
        user.refreshToken = refreshToken;

        //using save kicks-in mongoose model, where, in our case , password is a required field,so to avoid that, we use "validateBeforeSave" field.
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

// User must be imported like this since it was not a default export,but a Named Export. We would not need {} and we could name the User to anything else, in case of a default export.

//Postman => It lets you send HTTP requests to your backend without needing a frontend.
// Used mainly for testing backend APIs during development. 
// POST /api/users/register ← API and POST/register is the API endpoint.


// asyncHandler is a Wrapper. it wraps async functions so that we dont have to apply try,catch each time.

//register user
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

//login user => access and refresh token
const loginUser = asyncHandler( async(req,res) => {
    // Steps Involved:
    // take the data from request body
    // decide whether you want username or email, or maybe both as entry request.
    // find the user
    // check password 
    // generate access and refresh token
    // return cookie

    const {email, username, password} = req.body;

    if(!username || !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    // while checking password, we can't use "User" with a capital 'u' while checking our methods like we do in User.findOne because that user is created by mongo and we are going to use our own methods. And for that purpose, 'user' does the job. so ,user.isPasswordCorrect, not 'User'.

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User credentials");
    }


    // since we have reached here, now we can proceed to generate access and refresh tokens, and since we are going to do it many times, let's create a method for it.

    // we add await here, since there are some operations in the function which might require  some extra time.
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // we are making a second query to database, so decide if you this is a heavy operation. you can simply save the user by making changes to it.

    // 1. second query
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // 2. making changes to existing user
    // user.password = undefined;
    // user.refreshToken = undefined;
    // const loggedInUser = user;

     
    // after applying these options, cookies are server-modifiable only, you cannot make changes in it from frontend.
    const options = {
        httpOnly: true,
        secure: true
    }


    //A cookie is a small piece of data that a server stores in the user’s browser.
    //Your server tells the browser
    // Store accessToken
    // Store refreshToken
    // The browser saves them as cookies.
    
    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res) => {

    // here we have req.user along with req.body, because verifyJwt middleware runs first in which we attached this user, (req.user = user).
    // that's why, we can access req.user directly here

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        //  httpOnly ensures JS cannot access our cookie, so document.cookie can't access it.
        httpOnly: true,
        // secure ensures our cookie is only sent over HTTPS
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out"))

    
})

 


export {registerUser,
        loginUser,
        logoutUser
};



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

 





