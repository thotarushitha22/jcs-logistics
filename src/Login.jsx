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
      await loginUser({ email, password });
      toast.success("Logged in successfully!");
      navigate("/warehouse"); 
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <form onSubmit={handleLogin} style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "300px" }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Logistics Login</h2>
        <input 
          type="email" placeholder="Email" required 
          value={email} onChange={(e) => setEmail(e.target.value)} 
          style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ccc" }} 
        />
        <input 
          type="password" placeholder="Password" required 
          value={password} onChange={(e) => setPassword(e.target.value)} 
          style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }} 
        />
        <button type="submit" style={{ width: "100%", padding: "10px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
          Log In
        </button>
      </form>
    </div>
  );
}