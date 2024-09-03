import { Comment } from "../models/comment.model.js";
import ErrorHandler from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;

    if (userId !== req.user._id) {
      return next(
        new ErrorHandler("You are not allowed to create this comment", 400)
      );
    }

    const comment = await Comment.create({
      content,
      postId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Comment Created",
      comment,
    });
  } catch (error) {
    console.log("CREATE COMMENT ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const getPostComments = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ postId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log("GET POST COMMENTS ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const likeComment = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return next(new ErrorHandler("Comment Not Found", 400));
    }

    const userIndex = comment.likes.indexOf(req.user._id);

    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user._id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment liked",
      comment,
    });
  } catch (error) {
    console.log("LIKE COMMENT ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const editComment = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return next(new ErrorHandler("Comment Not Found", 400));
    }

    if (comment.userId !== req.user._id && !req.user.isAdmin) {
      return next(
        new ErrorHandler("You are not allowed to edit this comment", 400)
      );
    }

    const editedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: req.body.content,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Comment Updated",
      editedComment,
    });
  } catch (error) {
    console.log("EDIT COMMENT ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return next(new ErrorHandler("Comment Not Found", 400));
    }

    if (comment.userId !== req.user._id && !req.user.isAdmin) {
      return next(
        new ErrorHandler("You are not allowed to edit this comment", 400)
      );
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment Deleted",
    });
  } catch (error) {
    console.log("DELETE COMMENT ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new ErrorHandler("You are not authorised to access the comments", 400)
    );
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalComments=await Comment.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthCreatedComments=await Comment.countDocuments({
      createdAt:{
        $gte:oneMonthAgo
      }
    })

    return res.status(200).json({
      success:true,
      comments,
      totalComments,
      lastMonthCreatedComments
    })
  } catch (error) {
    console.log("GET COMMENTS ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};
