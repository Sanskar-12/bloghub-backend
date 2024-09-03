import express from "express";
import { config } from "dotenv";
import connectDB from "./db/connectDB.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import commentRoute from "./routes/comment.route.js";
import postRoute from "./routes/post.route.js";
import ErrorMiddleware from "./middlewares/errorMiddleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";

config({
  path: "./.env",
});

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

connectDB();

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/comment", commentRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});

app.use(ErrorMiddleware);
