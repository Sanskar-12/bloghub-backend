import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { create, deletePosts, getPosts, updatePost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create-post", verifyToken, create);
router.get("/get-posts", verifyToken, getPosts);
router.delete("/delete-posts/:postId/:userId", verifyToken, deletePosts);
router.put("/update-posts/:postId/:userId", verifyToken, updatePost);

export default router;
