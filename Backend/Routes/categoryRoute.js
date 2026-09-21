import express from "express"

import { getAllCate, getCategory, addCategory, updateCategor,deleteCategory } from "../Controllers/CategoryControler.js"
import requireAuth from "../Middleware/requireAuth.js";
import requireAdmin from "../Middleware/requireAdmin.js";
import upload from "../Middleware/upload.js";


const categoryRouter= express.Router();

// all category
categoryRouter.get("/", getAllCate);

//  one category
categoryRouter.get("/:id", getCategory);

//  add category 
categoryRouter.post("/add",requireAuth,requireAdmin, upload.single("image"), addCategory);

//  update

categoryRouter.put("/update/:id",requireAuth,requireAdmin,upload.single("image"), updateCategor);

// Delete 
categoryRouter.delete("/delete/:id",requireAuth,requireAdmin, deleteCategory)

export default categoryRouter;