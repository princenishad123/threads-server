import express from 'express'
import {protectedRoutes} from "../middlewares/protectedRoutes.js"
import { commentPostController, deletePostController, doFollowoController, getAutherPosts, getComments, getFollowersDetails, getNotification, getPostsController, likePostController, postController, uploadPostImage } from '../controllers/post.controller.js'

const postRouter = express.Router()


postRouter.post("/upload-post",protectedRoutes,postController)
postRouter.post("/upload-image",protectedRoutes,uploadPostImage)
postRouter.post("/like/:postId",protectedRoutes,likePostController)
postRouter.get("/get-posts", getPostsController)
postRouter.get("/followers",protectedRoutes,getFollowersDetails)
postRouter.delete("/delete-post/:postId", deletePostController)
postRouter.post("/follow-to-user/:username", protectedRoutes, doFollowoController)

postRouter.get("/get-notification",protectedRoutes,getNotification)
postRouter.get("/get-authors-posts/:id",protectedRoutes,getAutherPosts)
postRouter.post("/comment/:postId", protectedRoutes, commentPostController)
postRouter.get("/get-comments/:postId",protectedRoutes,getComments)
// postRouter.post("/post",protectedRoutes,postController)

export default postRouter