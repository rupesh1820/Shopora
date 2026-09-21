import express from "express";
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import {
  getAllUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
} from "../Controllers/userController.js"

const userRouter = express.Router();

// Get all users
userRouter.get("/",requireAuth,requireAdmin, getAllUsers);

// Get single user
userRouter.get("/:id",requireAuth,requireAdmin, getUserById);

// Block / Unblock user
userRouter.patch("/toggle-block/:id",requireAuth,requireAdmin, toggleBlockUser);

// Delete user
userRouter.delete("/:id",requireAuth,requireAdmin, deleteUser);

export default userRouter;