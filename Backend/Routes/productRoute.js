import express from "express"
import { getAllProducts, getproduct,addProduct,updateProduct,deleteProduct,updateStock } from "../Controllers/productController.js"
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import upload from "../Middleware/upload.js";


const productRouter = express.Router();

// Sab products 
productRouter.get("/", getAllProducts)

// ek product by id

productRouter.get("/:id", getproduct);

//  product Add
productRouter.post("/add",requireAuth, requireAdmin, upload.array("images", 3), addProduct);

// Update product

productRouter.put("/update/:id",requireAuth, requireAdmin, upload.array("images", 3), updateProduct);

// Delete product

productRouter.delete("/delete/:id",requireAuth,requireAdmin, deleteProduct);

// Update Stock

productRouter.patch("/update/:id/stock",requireAuth, requireAdmin, updateStock)


export default productRouter;