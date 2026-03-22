import {Router} from "express";
import {registerUser} from  "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"


const router = Router();

// router assigns routes based on URL path + HTTP request
// here register/login is URL path, and post, get etc are Http request
router.route("/register").post(
    //file handling, for avatar and cover image.
    // upload. fields expects array of objects ([{},{},...]).
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

    // "post method he hona chahiye kyuki information aap le rahe ho"
 router.route("/login").post(
    loginUser
 )

 // secured routes =>  only when user is logged in 
 router.route("/logout").post(verifyJWT, logoutUser)



export default router