import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import { createComment, deleteComment, editComment, getComments, getPostComments, likeComment } from "../controllers/comment.controller.js"

const router=express.Router()

router.post("/create",verifyToken,createComment)
router.get("/get/post/comments/:postId",getPostComments)
router.get("/like/comment/:commentId",verifyToken,likeComment)
router.put("/edit/comment/:commentId",verifyToken,editComment)
router.delete("/delete/comment/:commentId",verifyToken,deleteComment)
router.get("/get/all/comments",verifyToken,getComments)

export default router