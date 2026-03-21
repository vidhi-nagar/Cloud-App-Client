import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ loggedIn: false, details: null });
  const [loading, setLoading] = useState(true); // Loading state zaroori hai

  // 1. useEffect ka asli use: Page refresh par user ko wapas load karna
  useEffect(() => {
    const savedUser = localStorage.getItem("user_details");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser({
        loggedIn: true,
        details: JSON.parse(savedUser),
      });
    }
    setLoading(false); // Check khatam hone ke baad loading false
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user_details", JSON.stringify(userData));
    setUser({ loggedIn: true, details: userData });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_details");
    setUser({ loggedIn: false, details: null });
    // LocalStorage ko puri tarah clear karne ke liye niche wali line bhi add kar sakte hain
    // localStorage.clear();
    window.location.href = "/login";

    // localStorage.clear();
    // setUser({ loggedIn: false, details: null });
    // window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
      {/* Jab tak check ho raha hai, app render nahi hogi taaki flickering na ho */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
