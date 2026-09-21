import express from "express";
import requireAuth from "../Middleware/requireAuth.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../Controllers/addressController.js";

const addressRouter = express.Router();

// Get all addresses
addressRouter.get("/:userId",requireAuth, getAddresses);

// Add address
addressRouter.post("/:userId/add",requireAuth, addAddress);

// Update address
addressRouter.put("/:userId/update/:addressId",requireAuth, updateAddress);

// Delete address
addressRouter.delete("/:userId/delete/:addressId",requireAuth, deleteAddress);

// Set default address
addressRouter.patch("/:userId/default/:addressId",requireAuth, setDefaultAddress);

export default addressRouter;