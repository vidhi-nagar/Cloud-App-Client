import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });
      const token = response.data.session?.access_token || response.data.token;
      const userObj = response.data.session?.user || response.data.user;
      if (token) {
        login(
          {
            email: userObj?.email || formData.email,
            full_name: userObj?.user_metadata?.full_name || "User",
          },
          token,
        );
        navigate("/dashboard");
      } else {
        alert("Token nahi mila!");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        /* ── OUTER CARD ── */
        .outer-card {
          width: 92vw;
          max-width: 1100px;
          height: 78vh;
          min-height: 520px;
          max-height: 700px;
          display: flex;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(37, 99, 235, 0.18), 0 8px 24px rgba(0,0,0,0.08);
          animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform: scale(0.94) translateY(24px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }

        /* ── LEFT — ANIMATED SIDE ── */
        .left {
          flex: 1;
          background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        /* Animated rings */
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.15);
          animation: pulse 4s ease-in-out infinite;
        }
        .ring-1 { width: 280px; height: 280px; animation-delay: 0s; }
        .ring-2 { width: 420px; height: 420px; animation-delay: 0.6s; }
        .ring-3 { width: 560px; height: 560px; animation-delay: 1.2s; }
        .ring-4 { width: 700px; height: 700px; animation-delay: 1.8s; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.04); opacity: 0.15; }
        }

        /* Floating blobs */
        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: glow-float 6s ease-in-out infinite;
        }
        .glow-1 { width:220px; height:220px; background:#60a5fa; opacity:0.25; top:-40px; left:-40px; animation-delay:0s; }
        .glow-2 { width:180px; height:180px; background:#c084fc; opacity:0.3; bottom:-20px; right:-20px; animation-delay:-3s; }
        @keyframes glow-float {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(16px,-20px); }
        }

        /* Floating file cards */
        .float-card {
          position: absolute;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          animation: floatCard 4s ease-in-out infinite;
          white-space: nowrap;
        }
        .float-card-1 { top: 14%; left: 8%;  animation-delay: 0s; }
        .float-card-2 { top: 32%; right: 6%; animation-delay: -1.5s; }
        .float-card-3 { bottom: 20%; left: 10%; animation-delay: -3s; }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        .fc-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display:flex; align-items:center; justify-content:center;
          font-size:15px;
        }

        /* Center content */
        .left-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
        }
        .left-logo {
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          backdrop-filter: blur(8px);
        }
        .left-title {
          font-size: 28px; font-weight: 800; line-height: 1.2;
          margin-bottom: 12px; letter-spacing: -0.5px;
        }
        .left-sub { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 260px; margin: 0 auto 28px; }

        .pill-row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
        .pill {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 5px 14px;
          font-size: 12px; font-weight: 600; color: white;
          backdrop-filter: blur(8px);
        }

        /* ── RIGHT — FORM SIDE ── */
        .right {
          width: 46%;
          min-width: 340px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          position: relative;
        }

        .form-inner {
          width: 100%;
          animation: slideIn 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateX(24px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .brand-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 36px;
        }
        .brand-dot {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .brand-name { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }

        .form-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .form-sub   { font-size: 13.5px; color: #94a3b8; margin-bottom: 28px; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12.5px; font-weight: 600; color: #374151; margin-bottom: 6px; letter-spacing: 0.02em; }

        .input-box {
          position: relative;
        }
        .input-box svg {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #94a3b8; pointer-events: none;
        }
        .input-box input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: all 0.2s;
        }
        .input-box input::placeholder { color: #c0cce0; }
        .input-box input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }

        .btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white; border: none; border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer; margin-top: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn:hover   { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.45); }
        .btn:active  { transform: translateY(0); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider { display:flex; align-items:center; gap:10px; margin: 20px 0; }
        .div-line { flex:1; height:1px; background:#f1f5f9; }
        .div-txt  { font-size:11px; color:#cbd5e1; font-weight:600; letter-spacing:0.08em; }

        .signup-txt { text-align:center; font-size:13.5px; color:#94a3b8; }
        .signup-link { color:#2563eb; font-weight:700; text-decoration:none; }
        .signup-link:hover { text-decoration:underline; }

        /* Mobile */
        @media (max-width: 700px) {
          .outer-card { width: 96vw; height: auto; flex-direction: column; max-height: none; }
          .left { min-height: 220px; padding: 32px 24px; }
          .right { width: 100%; min-width: unset; padding: 32px 28px; }
          .ring-3, .ring-4 { display: none; }
          .float-card-2, .float-card-3 { display: none; }
        }
      `}</style>

      <div className="login-page">
        <div className="outer-card">
          {/* ── LEFT ANIMATED PANEL ── */}
          <div className="left">
            {/* Rings */}
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
            <div className="ring ring-4" />

            {/* Glows */}
            <div className="glow glow-1" />
            <div className="glow glow-2" />

            {/* Floating cards */}
            <div className="float-card float-card-1">
              <div
                className="fc-icon"
                style={{ background: "rgba(96,165,250,0.3)" }}
              >
                📄
              </div>
              Resume.pdf uploaded
            </div>
            <div className="float-card float-card-2">
              <div
                className="fc-icon"
                style={{ background: "rgba(167,139,250,0.3)" }}
              >
                🖼️
              </div>
              Photos synced
            </div>
            <div className="float-card float-card-3">
              <div
                className="fc-icon"
                style={{ background: "rgba(52,211,153,0.3)" }}
              >
                📁
              </div>
              Projects folder
            </div>

            {/* Center text */}
            <div className="left-content">
              <div className="left-logo">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 2z" />
                </svg>
              </div>
              <div className="left-title">
                Your files,
                <br />
                always with you
              </div>
              <p className="left-sub">
                Store, share and access files securely from anywhere, on any
                device.
              </p>
              <div className="pill-row">
                <div className="pill">✦ 500 MB Free</div>
                <div className="pill">🔒 Encrypted</div>
                <div className="pill">⚡ Fast</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div className="right">
            <div className="form-inner">
              <div className="brand-row">
                <div className="brand-dot">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 2z" />
                  </svg>
                </div>
                <span className="brand-name">CloudVault</span>
              </div>

              <h1 className="form-title">Welcome back 👋</h1>
              <p className="form-sub">Sign in to continue to your dashboard</p>

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label>Email Address</label>
                  <div className="input-box">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Password</label>
                  <div className="input-box">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button className="btn" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In →</span>
                  )}
                </button>
              </form>

              <div className="divider">
                <div className="div-line" />
                <span className="div-txt">NEW HERE?</span>
                <div className="div-line" />
              </div>

              <p className="signup-txt">
                Don't have an account?{" "}
                <Link to="/signup" className="signup-link">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
