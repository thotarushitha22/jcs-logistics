import { useState } from "react";
import { loginUser } from "./api"; 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Note: loginUser expects an object with email and password
      await loginUser({ email, password });
      toast.success("Logged in successfully!");
      navigate("/warehouse"); 
    } catch (err) {
      toast.error("Invalid credentials. Make sure you are an admin/merchant.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <form onSubmit={handleLogin} style={{ background: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        
        <h2 style={{ textAlign: "center", marginBottom: "24px", fontSize: "24px", color: "#0f172a", fontWeight: "800" }}>Logistics Login</h2>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Email Address</label>
          <input 
            type="email" required 
            value={email} onChange={(e) => setEmail(e.target.value)} 
            placeholder="merchant@jcs.com"
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#0f172a", fontSize: "15px", outline: "none" }} 
          />
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Password</label>
          <input 
            type="password" required 
            value={password} onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#0f172a", fontSize: "15px", outline: "none" }} 
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: "14px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
          Log In
        </button>
      </form>
    </div>
  );
}