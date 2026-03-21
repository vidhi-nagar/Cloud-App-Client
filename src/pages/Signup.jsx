import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Console mein check karein kya data ja raha hai
      console.log("Sending Signup Data:", formData);

      const res = await api.post("/auth/signup", formData);

      // Agar status 201 (Created) ya 200 hai, tabhi navigate karein
      if (res.status === 201 || res.status === 200) {
        alert("Signup Successful! Ab login karein.");
        navigate("/login");
      }
    } catch (err) {
      // Yahan navigate BILKUL NAHI hona chahiye
      console.error("Signup Error Details:", err.response?.data);

      // Error message dikhayein jo backend se aa raha hai
      const errorMsg =
        err.response?.data?.error ||
        "Signup fail ho gaya. Email shayad pehle se hai.";
      alert("Error: " + errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Create Account 🚀
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Pehle se account hai?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login karein
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
