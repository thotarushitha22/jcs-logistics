import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import WarehouseDashboard from "./Warehouse/WarehouseDashboard";
import DispatchDashboard from "./Dispatch/DispatchDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Automatically go to warehouse when opening the app */}
        <Route path="/" element={<Navigate to="/warehouse" replace />} />
        
        {/* The dashboards */}
        <Route path="/warehouse" element={<WarehouseDashboard />} />
        <Route path="/dispatch" element={<DispatchDashboard />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}