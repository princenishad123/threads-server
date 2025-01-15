import express from "express"
import { checkAuthController, findUserByUsername, getUserByUsername, loginController, logoutController, signupController, updateUserController, uploadProfilePicture } from "../controllers/auth.controller.js"
import {protectedRoutes} from "../middlewares/protectedRoutes.js"
import { getPostsController } from "../controllers/post.controller.js"
const router = express.Router()

router.post("/auth/sign-up", signupController)
router.post("/auth/login",loginController)
router.post("/auth/logout", logoutController)
router.get("/auth/check-auth", protectedRoutes, checkAuthController)
router.put('/auth/update-profile',protectedRoutes,updateUserController)
router.put('/auth/upload-profile-picture', protectedRoutes, uploadProfilePicture)
router.get('/get-user/:username', protectedRoutes, getUserByUsername)

router.get('/auth/search-user', protectedRoutes, findUserByUsername)




export default router;
