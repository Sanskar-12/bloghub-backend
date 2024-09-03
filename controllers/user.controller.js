import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/error.js";
import bcrypt from "bcrypt";

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;

  let { username, email, password, profilePicture } = req.body;

  if (userId !== req.user._id) {
    return next(new ErrorHandler("Unauthorised", 400));
  }

  if (password) {
    if (password.length < 6) {
      return next(
        new ErrorHandler("Password must be atleast 6 characters", 400)
      );
    }
    password = await bcrypt.hash(password, 10);
  }

  if (username) {
    if (username.includes(" ")) {
      return next(new ErrorHandler("Username cannot contain spaces", 400));
    }

    if (!username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        new ErrorHandler("Username can only contain letters and numbers", 400)
      );
    }
  }

  try {
    let user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new ErrorHandler("User Not Found", 400));
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      user.password = password;
    }
    if (email) {
      user.email = email;
    }

    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    return res.status(200).json({
      message: "User Profile Updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log("UPDATE USER ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const deleteUserProfile = async (req, res, next) => {
  const { userId } = req.params;

  if (userId !== req.user._id) {
    return next(new ErrorHandler("Unauthorised", 400));
  }

  try {
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User Profile Deleted",
      success: true,
    });
  } catch (error) {
    console.log("DELETE USER ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(ErrorHandler("You are not allowed to see all users", 400));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find({})
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: {
        $gte: lastMonth,
      },
    });

    return res.status(200).json({
      success: true,
      users,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    console.log("GET ALL USER ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  if (!req.user.isAdmin && userId !== req.user._id) {
    return next(ErrorHandler("You are not allowed to delete this users", 400));
  }
  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    console.log("DELETE USER ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
};

export const getUser=async(req,res,next)=>{
  try {
    const user=await User.findById(req.params.userId)

    if(!user)
    {
      return next(ErrorHandler("User Not Found", 400));
    }

    return res.status(200).json({
      success:true,
      user
    })
  } catch (error) {
    console.log("DELETE USER ERROR", error);
    return next(new ErrorHandler(error, 400));
  }
}