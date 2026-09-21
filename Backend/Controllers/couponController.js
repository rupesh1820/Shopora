import Coupon from "../Model/Coupon.js";

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discount,
      minOrder,
      maxDiscount,
      expiryDate,
      isActive,
    } = req.body;

    if (!code || !discountType || discount === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Required coupon fields are missing",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discount,
      minOrder: minOrder || 0,
      maxDiscount: maxDiscount || 0,
      expiryDate,
      isActive: isActive ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// Get coupon by code
export const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
    });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      code,
      discountType,
      discount,
      minOrder,
      maxDiscount,
      expiryDate,
      isActive,
    } = req.body;

    coupon.code = code
      ? code.toUpperCase()
      : coupon.code;

    coupon.discountType = discountType ?? coupon.discountType;
    coupon.discount = discount ?? coupon.discount;
    coupon.minOrder = minOrder ?? coupon.minOrder;
    coupon.maxDiscount = maxDiscount ?? coupon.maxDiscount;
    coupon.expiryDate = expiryDate ?? coupon.expiryDate;
    coupon.isActive = isActive ?? coupon.isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};