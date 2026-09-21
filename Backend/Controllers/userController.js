import User from "../Model/User.js";
import Order from "../Model/Order.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((e) => e._id);

    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: "$userId",
          orders: { $sum: 1 },
          spent: { $sum: "$totalAmount" },
        },
      },
    ]);

    const statsMap = new Map(
      orderStats.map((e) => [
        e._id.toString(),
        {
          orders: e.orders,
          spent: e.spent,
        },
      ])
    );

    const formattedUsers = users.map((e) => {
      const stats = statsMap.get(e._id.toString()) || {
        orders: 0,
        spent: 0,
      };

      return {
        ...e,
        orders: stats.orders,
        spent: stats.spent,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get single user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "user",
    })
      .select("-password -otp -otpExpires")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: user._id,
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: "$userId",
          orders: { $sum: 1 },
          spent: { $sum: "$totalAmount" },
        },
      },
    ]);

    const stats = orderStats[0] || {
      orders: 0,
      spent: 0,
    };

    res.status(200).json({
      success: true,
      user: {
        ...user,
        orders: stats.orders,
        spent: stats.spent,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// Block / Unblock user
export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Toggle block user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndDelete({
      _id: id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};