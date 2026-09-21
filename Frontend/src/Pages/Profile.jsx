import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER;

const Profile = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const section = params.get("section") || "profile";

  const token = localStorage.getItem("token");
  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [user, setUser] = useState(savedUser);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });

  const [editLoading, setEditLoading] = useState(false);

  if (!token || !savedUser) {
    navigate("/login");
    return null;
  }

  const userId = savedUser._id;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= ADDRESS ================= */

  const getAddresses = async () => {
    try {
      setAddressLoading(true);

      const res = await axios.get(
        `${API_URL}/api/address/${userId}`,
        config
      );

      const data =
        res.data.addresses ||
        res.data.data ||
        res.data;

      setAddresses(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log("Address error:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (section === "address") {
      getAddresses();
    }
  }, [section]);

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]:
        e.target.name === "isDefault"
          ? e.target.checked
          : e.target.value,
    });
  };

  const saveAddress = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await axios.put(
          `${API_URL}/api/address/${userId}/update/${editingAddress._id}`,
          addressForm,
          config
        );
      } else {
        await axios.post(
          `${API_URL}/api/address/${userId}/add`,
          addressForm,
          config
        );
      }

      setShowAddressForm(false);
      setEditingAddress(null);

      setAddressForm({
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });

      getAddresses();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to save address"
      );
    }
  };

  const editAddress = (e) => {
    setEditingAddress(e);

    setAddressForm({
      name: e.name || "",
      phone: e.phone || "",
      addressLine: e.addressLine || "",
      city: e.city || "",
      state: e.state || "",
      pincode: e.pincode || "",
      isDefault: e.isDefault || false,
    });

    setShowAddressForm(true);
  };

  const deleteAddress = async (addressId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API_URL}/api/address/${userId}/delete/${addressId}`,
        config
      );

      getAddresses();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete address"
      );
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await axios.patch(
        `${API_URL}/api/address/${userId}/default/${addressId}`,
        {},
        config
      );

      getAddresses();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to set default address"
      );
    }
  };

  /* ================= EDIT PROFILE ================= */

  useEffect(() => {
    if (section === "edit") {
      setEditForm({
        fullName: user.fullName || "",
        email: user.email || "",
      });
    }
  }, [section]);

  const editProfile = () => {
    navigate(`/profile?section=edit&user=${userId}`);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setEditLoading(true);

      const res = await axios.patch(
        `${API_URL}/api/auth/profile/edit`,
        editForm,
        config
      );

      const updatedUser =
        res.data.user ||
        res.data.data ||
        {
          ...user,
          ...editForm,
        };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      navigate(`/profile?user=${userId}`);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setEditLoading(false);
    }
  };

  /* ================= MENU ================= */

  const menu = [
    {
      title: "My Orders",
      description: "View and track your orders",
      icon: Package,
      link: `/orders?user=${userId}`,
    },
    {
      title: "Wishlist",
      description: "Your saved products",
      icon: Heart,
      link: `/wishlist?user=${userId}`,
    },
    {
      title: "My Address",
      description: "Manage your delivery addresses",
      icon: MapPin,
      link: `/profile?section=address&user=${userId}`,
    },
  ];

  /* ================= ADDRESS SECTION ================= */

  if (section === "address") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <button
          onClick={() =>
            navigate(`/profile?user=${userId}`)
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              My Address
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your delivery addresses
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAddress(null);
              setAddressForm({
                name: "",
                phone: "",
                addressLine: "",
                city: "",
                state: "",
                pincode: "",
                isDefault: false,
              });
              setShowAddressForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600"
          >
            <Plus size={18} />
            Add Address
          </button>
        </div>

        {/* ADDRESS FORM */}

        {showAddressForm && (
          <form
            onSubmit={saveAddress}
            className="mt-6 rounded-2xl border bg-white p-5 sm:p-6"
          >
            <h2 className="text-xl font-bold">
              {editingAddress
                ? "Edit Address"
                : "Add New Address"}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <input
                name="name"
                value={addressForm.name}
                onChange={handleAddressChange}
                placeholder="Full Name"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <input
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                placeholder="Phone Number"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <input
                name="addressLine"
                value={addressForm.addressLine}
                onChange={handleAddressChange}
                placeholder="Address"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500 sm:col-span-2"
              />

              <input
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                placeholder="City"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <input
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                placeholder="State"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

              <input
                name="pincode"
                value={addressForm.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode"
                required
                className="rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />

            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
              />
              Set as default address
            </label>

            <div className="mt-5 flex gap-3">

              <button
                type="submit"
                className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600"
              >
                {editingAddress
                  ? "Update Address"
                  : "Save Address"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                }}
                className="rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>
          </form>
        )}

        {/* ADDRESS LIST */}

        {addressLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading addresses...
          </div>
        ) : addresses.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {addresses.map((e) => (
              <div
                key={e._id}
                className="rounded-2xl border bg-white p-5"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="font-bold">
                      {e.name}
                    </h3>

                    {e.isDefault && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
                        <Star size={12} />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => editAddress(e)}
                      className="rounded-lg border p-2 hover:bg-gray-50"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteAddress(e._id)}
                      className="rounded-lg border p-2 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                <div className="mt-4 text-sm text-gray-600">

                  <p>{e.addressLine}</p>

                  <p>
                    {e.city}, {e.state}
                  </p>

                  <p>
                    India - {e.pincode}
                  </p>

                  <p className="mt-2">
                    Phone: {e.phone}
                  </p>

                </div>

                {!e.isDefault && (
                  <button
                    onClick={() =>
                      setDefaultAddress(e._id)
                    }
                    className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700"
                  >
                    Set as Default
                  </button>
                )}

              </div>
            ))}

          </div>
        ) : (
          <div className="mt-8 rounded-2xl border bg-white py-16 text-center">

            <MapPin
              size={50}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-xl font-bold">
              No Address Added
            </h2>

            <p className="mt-2 text-gray-500">
              Add an address for faster checkout.
            </p>

          </div>
        )}

      </main>
    );
  }

  /* ================= EDIT PROFILE SECTION ================= */

  if (section === "edit") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        <button
          onClick={() =>
            navigate(`/profile?user=${userId}`)
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div className="rounded-2xl border bg-white p-5 sm:p-6">

          <h1 className="text-2xl font-bold">
            Edit Profile
          </h1>

          <form
            onSubmit={updateProfile}
            className="mt-6 space-y-5"
          >

            <div>
              <label className="text-sm font-medium">
                Full Name
              </label>

              <input
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {editLoading
                ? "Updating..."
                : "Update Profile"}
            </button>

          </form>

        </div>

      </main>
    );
  }

  /* ================= MAIN PROFILE ================= */

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      {/* PROFILE HEADER */}

      <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">

        <div className="flex flex-col items-center gap-5 sm:flex-row">

          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-green-500">

            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={42} />
            )}

          </div>

          <div className="text-center sm:text-left">

            <h1 className="text-2xl font-bold sm:text-3xl">
              {user.fullName}
            </h1>

            <p className="mt-1 text-gray-300">
              {user.email}
            </p>

          </div>

        </div>

      </div>

      {/* ACCOUNT */}

      <section className="mt-8">

        <h2 className="text-xl font-bold">
          My Account
        </h2>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white">

          {menu.map((e, index) => {
            const Icon = e.icon;

            return (
              <Link
                key={e.title}
                to={e.link}
                className={`flex items-center gap-4 p-5 transition hover:bg-gray-50 ${
                  index !== menu.length - 1
                    ? "border-b"
                    : ""
                }`}
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500">
                  <Icon size={21} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold">
                    {e.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {e.description}
                  </p>

                </div>

                <ChevronRight
                  size={20}
                  className="text-gray-400"
                />

              </Link>
            );
          })}

        </div>

      </section>

      {/* PERSONAL INFORMATION */}

      <section className="mt-8 rounded-2xl border bg-white p-5 sm:p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-bold">
            Personal Information
          </h2>

          <button
            onClick={editProfile}
            className="flex items-center gap-1 text-sm font-semibold text-green-600"
          >
            <Pencil size={15} />
            Edit
          </button>

        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <div>
            <p className="text-sm text-gray-500">
              Full Name
            </p>

            <p className="mt-1 font-medium">
              {user.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 break-all font-medium">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="mt-1 font-medium">
              {user.phone || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Account Type
            </p>

            <p className="mt-1 font-medium capitalize">
              {user.role || "user"}
            </p>
          </div>

        </div>

      </section>

      {/* LOGOUT */}

      <button
        onClick={logout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-5 py-3 font-semibold text-red-500 hover:bg-red-50"
      >
        <LogOut size={19} />
        Logout
      </button>

    </main>
  );
};

export default Profile;