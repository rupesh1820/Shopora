import Address from "../Model/Address.js";

// Get all addresses
export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    // User sirf apne addresses dekh sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own addresses",
      });
    }

    const addresses = await Address.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    // User sirf apne account me address add kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only add address to your own account",
      });
    }

    const {
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (!name || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    // Check first address
    const addressCount = await Address.countDocuments({ userId });

    const shouldBeDefault =
      addressCount === 0 || isDefault === true;

    // New address default hai to purane sab non-default
    if (shouldBeDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      userId,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // User sirf apna address update kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own address",
      });
    }

    const {
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (isDefault === true) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    address.name = name ?? address.name;
    address.phone = phone ?? address.phone;
    address.addressLine = addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // User sirf apna address delete kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own address",
      });
    }

    const address = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Agar default address delete hua,
    // to kisi existing address ko default bana do
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId }).sort({
        createdAt: 1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // User sirf apna address default kar sakta hai
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only change your own address",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};