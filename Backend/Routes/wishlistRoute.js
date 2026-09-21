import express from "express"
import requireAuth from "../Middleware/requireAuth.js";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../Controllers/wishlistController.js"

const wishlistRouter = express.Router();

// get users wishlist

wishlistRouter.get('/:userId',requireAuth, getWishlist);

//  add product to wishlist

wishlistRouter.post("/:userId/add",requireAuth, addToWishlist);

// Remove from wishlist 

wishlistRouter.delete("/:userId/remove/:productId",requireAuth, removeFromWishlist);

//  Clear wishlist

wishlistRouter.delete("/:useId/clear",requireAuth, clearWishlist);


export default wishlistRouter;