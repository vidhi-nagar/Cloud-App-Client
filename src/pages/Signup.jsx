import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", formData);
      if (res.status === 201 || res.status === 200) {
        alert("Signup Successful 🎉! Login Now.");
        navigate("/login");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Signup fail ho gaya. Email shayad pehle se hai.";
      alert("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-page {
          width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: #f0f4ff;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .outer-card {
          width: 92vw; max-width: 1100px;
          height: 78vh; min-height: 560px; max-height: 720px;
          display: flex; border-radius: 28px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(37,99,235,0.18), 0 8px 24px rgba(0,0,0,0.08);
          animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform: scale(0.94) translateY(24px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }

        /* ── RIGHT FORM (first on mobile) ── */
        .right {
          width: 46%; min-width: 340px; background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 52px; position: relative;
        }
        .form-inner {
          width: 100%;
          animation: slideIn 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateX(-24px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .brand-row { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
        .brand-dot {
          width:36px; height:36px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border-radius:10px; display:flex; align-items:center; justify-content:center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .brand-name { font-size:18px; font-weight:800; color:#0f172a; letter-spacing:-0.3px; }

        .form-title { font-size:24px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; margin-bottom:4px; }
        .form-sub   { font-size:13px; color:#94a3b8; margin-bottom:22px; }

        .field { margin-bottom:14px; }
        .field label { display:block; font-size:12.5px; font-weight:600; color:#374151; margin-bottom:5px; }
        .input-box { position:relative; }
        .input-box svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .input-box input {
          width:100%; padding:11px 16px 11px 42px;
          border:1.5px solid #e2e8f0; border-radius:12px;
          font-size:14px; font-family:'Outfit',sans-serif;
          color:#0f172a; background:#f8fafc; outline:none; transition:all 0.2s;
        }
        .input-box input::placeholder { color:#c0cce0; }
        .input-box input:focus {
          border-color:#2563eb; background:#fff;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }

        .btn {
          width:100%; padding:12px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color:white; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-size:15px; font-weight:700;
          cursor:pointer; margin-top:6px; transition:all 0.2s;
          box-shadow:0 4px 20px rgba(37,99,235,0.35);
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn:hover   { transform:translateY(-2px); box-shadow:0 8px 28px rgba(37,99,235,0.45); }
        .btn:active  { transform:translateY(0); }
        .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .spinner {
          width:16px; height:16px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:white;
          border-radius:50%; animation:spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .divider { display:flex; align-items:center; gap:10px; margin:18px 0; }
        .div-line { flex:1; height:1px; background:#f1f5f9; }
        .div-txt  { font-size:11px; color:#cbd5e1; font-weight:600; letter-spacing:0.08em; }

        .login-txt  { text-align:center; font-size:13.5px; color:#94a3b8; }
        .login-link { color:#2563eb; font-weight:700; text-decoration:none; }
        .login-link:hover { text-decoration:underline; }

        /* ── LEFT ANIMATED PANEL ── */
        .left {
          flex:1;
          background: linear-gradient(135deg, #059669 0%, #0d9488 40%, #0891b2 100%);
          position:relative; overflow:hidden;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:48px 40px;
        }

        .ring {
          position:absolute; border-radius:50%;
          border:1.5px solid rgba(255,255,255,0.15);
          animation:pulse 4s ease-in-out infinite;
        }
        .ring-1 { width:240px; height:240px; animation-delay:0s; }
        .ring-2 { width:380px; height:380px; animation-delay:0.7s; }
        .ring-3 { width:520px; height:520px; animation-delay:1.4s; }
        .ring-4 { width:660px; height:660px; animation-delay:2.1s; }
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:0.35; }
          50%      { transform:scale(1.05); opacity:0.12; }
        }

        .glow { position:absolute; border-radius:50%; filter:blur(60px); animation:glow-float 6s ease-in-out infinite; }
        .glow-1 { width:200px; height:200px; background:#34d399; opacity:0.3; top:-40px; right:-30px; animation-delay:0s; }
        .glow-2 { width:180px; height:180px; background:#22d3ee; opacity:0.25; bottom:-20px; left:-20px; animation-delay:-3s; }
        @keyframes glow-float {
          0%,100% { transform:translate(0,0); }
          50%      { transform:translate(14px,-18px); }
        }

        .float-card {
          position:absolute;
          background:rgba(255,255,255,0.12); backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,0.2); border-radius:14px;
          padding:10px 16px; display:flex; align-items:center; gap:10px;
          color:white; font-size:13px; font-weight:500;
          animation:floatCard 4s ease-in-out infinite; white-space:nowrap;
        }
        .float-card-1 { top:12%; right:8%;  animation-delay:0s; }
        .float-card-2 { top:34%; left:6%;   animation-delay:-1.5s; }
        .float-card-3 { bottom:18%; right:9%; animation-delay:-3s; }
        @keyframes floatCard {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-10px); }
        }
        .fc-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; }

        .left-content { position:relative; z-index:10; text-align:center; color:white; }
        .left-logo {
          width:64px; height:64px;
          background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3);
          border-radius:20px; display:flex; align-items:center; justify-content:center;
          margin:0 auto 20px; backdrop-filter:blur(8px);
        }
        .left-title { font-size:26px; font-weight:800; line-height:1.2; margin-bottom:12px; letter-spacing:-0.5px; }
        .left-sub { font-size:14px; color:rgba(255,255,255,0.7); line-height:1.6; max-width:260px; margin:0 auto 28px; }

        .pill-row { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
        .pill {
          background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25);
          border-radius:20px; padding:5px 14px;
          font-size:12px; font-weight:600; color:white; backdrop-filter:blur(8px);
        }

        /* Steps */
        .steps { display:flex; flex-direction:column; gap:12px; margin-top:28px; }
        .step {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,0.1); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,0.15);
          border-radius:12px; padding:10px 16px; text-align:left;
          animation:floatCard 5s ease-in-out infinite;
        }
        .step:nth-child(2) { animation-delay:-1.5s; }
        .step:nth-child(3) { animation-delay:-3s; }
        .step-num {
          width:28px; height:28px; border-radius:8px;
          background:rgba(255,255,255,0.2);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:800; color:white; flex-shrink:0;
        }
        .step-text { font-size:13px; font-weight:500; color:white; }
        .step-sub  { font-size:11px; color:rgba(255,255,255,0.6); margin-top:1px; }

        @media (max-width:700px) {
          .outer-card { width:96vw; height:auto; flex-direction:column; max-height:none; }
          .right { width:100%; min-width:unset; padding:32px 28px; }
          .left  { min-height:220px; padding:28px 20px; }
          .ring-3,.ring-4 { display:none; }
          .steps { display:none; }
        }
      `}</style>

      <div className="signup-page">
        <div className="outer-card">
          {/* ── RIGHT FORM ── */}
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

              <h1 className="form-title">Create account 🚀</h1>
              <p className="form-sub">Join thousands storing files securely</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Full Name</label>
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
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                </div>

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
                      required
                      value={formData.email}
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
                      placeholder="Min. 6 characters"
                      required
                      value={formData.password}
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account →</span>
                  )}
                </button>
              </form>

              <div className="divider">
                <div className="div-line" />
                <span className="div-txt">ALREADY A MEMBER?</span>
                <div className="div-line" />
              </div>
              <p className="login-txt">
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* ── LEFT ANIMATED PANEL ── */}
          <div className="left">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
            <div className="ring ring-4" />
            <div className="glow glow-1" />
            <div className="glow glow-2" />

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
                Start for free,
                <br />
                scale forever
              </div>
              <p className="left-sub">
                Join CloudVault and get 500 MB free storage with all features
                unlocked.
              </p>

              <div className="steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <div>
                    <div className="step-text">Create your account</div>
                    <div className="step-sub">Takes less than 30 seconds</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <div>
                    <div className="step-text">Upload your files</div>
                    <div className="step-sub">Drag & drop or browse</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <div>
                    <div className="step-text">Share with anyone</div>
                    <div className="step-sub">Secure links & permissions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
