import express from "express"
import { getCart, addToCart, updateCartItem, removeCartItem,clearCart } from "../Controllers/cartController.js"
import requireAuth from "../Middleware/requireAuth.js";

const cartRouter = express.Router();

// user k cart k liye
cartRouter.get("/:userId",requireAuth, getCart);

// add product to cart
cartRouter.post("/:userId/add",requireAuth, addToCart);

// Update cart item quantity 
cartRouter.put("/:userId/update/:productId", requireAuth, updateCartItem);

// remove krne k liye cart se
cartRouter.delete("/:userId/remove/:productId",requireAuth,  removeCartItem)

// Cart clear krne k liye 

cartRouter.delete("/:userId/clear",requireAuth, clearCart)

export default cartRouter;