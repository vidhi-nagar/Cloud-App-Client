import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // FIX 1: useAuth se 'login' function nikalna hai (setUser nahi)
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      console.log("Full Backend Response:", response.data);

      // FIX: Supabase structure ke hisaab se token nikalna
      // Aapke response mein data.session.access_token hai
      const token = response.data.session?.access_token || response.data.token;

      // User details nikalne ke liye session.user ka use karein
      const userObj = response.data.session?.user || response.data.user;

      if (token) {
        const userData = {
          email: userObj?.email || email,
          full_name: userObj?.user_metadata?.full_name || "User",
        };

        // AuthContext mein save karein
        login(userData, token);

        console.log("Login Success! Navigating to dashboard...");
        navigate("/dashboard");
      } else {
        alert("Token nahi mila! Backend response ka format badal gaya hai.");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      alert(err.response?.data?.error || "Login fail ho gaya.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome Back 👋
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              required
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              // State update logic
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              required
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              // State update logic
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500">
          Account nahi hai?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-bold hover:underline"
          >
            Register karein
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
