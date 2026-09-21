import Product from "../Model/Product.js";
import uploadToCloudinary from "../utils/uploadToClodinary.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, gender, sale } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    if (gender) {
      filter.gender = {
        $regex: gender,
        $options: "i",
      };
    }

    if (sale === "true") {
      filter.off = {
        $gt: 0,
      };
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get single product
export const getproduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// Add product
export const addProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      gender,
      price,
      oldPrice,
      off,
      sizes,
      colors,
      description,
      stock,
    } = req.body;

    if (!title || !category || !gender || !price || !description) {
      return res.status(400).json({
        success: false,
        message: "Required product fields are missing",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const images = [];

    for (const file of req.files) {
      const imageUrl = await uploadToCloudinary(file.buffer);
      images.push(imageUrl);
    }

    const product = await Product.create({
      title,
      category,
      gender,
      price,
      oldPrice,
      off,
      sizes,
      colors,
      images,
      description,
      stock,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product",
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      title,
      category,
      gender,
      price,
      oldPrice,
      off,
      sizes,
      colors,
      description,
      stock,
      isActive,
    } = req.body;

    product.title = title ?? product.title;
    product.category = category ?? product.category;
    product.gender = gender ?? product.gender;
    product.price = price ?? product.price;
    product.oldPrice = oldPrice ?? product.oldPrice;
    product.off = off ?? product.off;
    product.sizes = sizes ?? product.sizes;
    product.colors = colors ?? product.colors;
    product.description = description ?? product.description;
    product.stock = stock ?? product.stock;
    product.isActive = isActive ?? product.isActive;

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = [];

      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file.buffer);
        newImages.push(imageUrl);
      }

      product.images = [
        ...product.images,
        ...newImages,
      ];
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Failed to update product:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// Update stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid stock is required",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};