import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import WarehouseDashboard from "./Warehouse/WarehouseDashboard";
import DispatchDashboard from "./Dispatch/DispatchDashboard";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={token ? <Navigate to="/warehouse" replace /> : <Navigate to="/login" replace />} />
        <Route path="/warehouse" element={token ? <WarehouseDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/dispatch" element={token ? <DispatchDashboard /> : <Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}