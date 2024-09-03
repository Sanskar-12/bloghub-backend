import { Post } from "../models/post.model.js";
import ErrorHandler from "../utils/error.js";

// slug for 10 Things To Eat
// 10-things-to-eat
// slug helps blogs to have a better SEO

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler("You are not allowed to create a post", 400));
  }

  if (!req.body.title || !req.body.content) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      slug,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Post created Successfully",
      post,
    });
  } catch (error) {
    console.log("CREATE POST ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          {
            title: { $regex: req.query.searchTerm, $options: "i" },
          },
          {
            content: { $regex: req.query.searchTerm, $options: "i" },
          },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthCreatedPosts = await Post.countDocuments({
      createdAt: {
        $gte: oneMonthAgo,
      },
    });

    return res.status(200).json({
      success: true,
      posts,
      totalPosts,
      lastMonthCreatedPosts,
    });
  } catch (error) {
    console.log("GET POST ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const deletePosts = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    if (!req.user.isAdmin || req.user._id != userId) {
      return next(
        new ErrorHandler("You are not allowed to delete the post", 400)
      );
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post Deleted Successfully",
    });
  } catch (error) {
    console.log("DELETE POST ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const updatePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user._id !== req.params.userId) {
    return next(
      new ErrorHandler("You are not allowed to update this post", 400)
    );
  }
  try {
    const updatePost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Post Updated Successfully",
      updatePost,
    });
  } catch (error) {
    console.log("UPDATE POST ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

