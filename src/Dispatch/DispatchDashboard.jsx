import { useState, useEffect } from "react";
import { Truck, MapPin, Send, CheckCircle2, Package, ChevronDown, Clock } from "lucide-react";
import { fetchAllOrders, fetchAllProducts, fetchAllUsers, updateOrderStatus } from "../logisticsApi"; 
import toast from "react-hot-toast";
import "./Dispatch.css";

export default function DispatchDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [dispatchDetails, setDispatchDetails] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [loadedOrders, loadedProducts, loadedUsers] = await Promise.all([
          fetchAllOrders(),
          fetchAllProducts(),
          fetchAllUsers()
        ]);
        
        const dispatchQueue = loadedOrders.filter(o => 
          ["PROCESSING", "PACKED", "SHIPPED"].includes(String(o.status || "").toUpperCase())
        );

        setOrders(dispatchQueue);
        setProducts(loadedProducts);
        setUsers(loadedUsers);
      } catch (err) {
        toast.error("Failed to load dispatch data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDetailChange = (orderId, field, value) => {
    setDispatchDetails(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value }
    }));
  };

  const dispatchOrder = async (order) => {
    const orderId = order.orderId || order._id || order.id;
    const details = dispatchDetails[orderId] || {};
    
    if (!details.partner) return toast.error("Please select a delivery partner first.");

    try {
      await updateOrderStatus(orderId, "SHIPPED");
      setOrders(prev => prev.map(o => (o.orderId || o._id || o.id) === orderId ? { ...o, status: "SHIPPED" } : o));
      toast.success(`Dispatched via ${details.partner}!`);
    } catch (err) {
      toast.error("Failed to save dispatch status to the database.");
    }
  };

  const getCustomerName = (order) => {
    return order.shippingName || order.shippingAddress?.name || order.address?.name || order.user_name || order.customerName || order.user?.name || order.buyer?.name || order.User?.name || order.customer?.name || "Customer";
  };
  
  const getCityState = (order) => {
    return order.shippingCity || order.shippingAddress?.city || order.shippingAddress?.address || order.address?.city || order.address?.address || order.user?.address?.city || order.user?.address || order.buyer?.address || order.city || order.shippingCity;
  };

  const pendingDispatch = orders.filter(o => ["PROCESSING", "PACKED"].includes(String(o.status).toUpperCase())).length;
  const inTransit = orders.filter(o => String(o.status).toUpperCase() === "SHIPPED").length;

  return (
    <div className="dp-layout">
      
      {/* HEADER (Search bar removed) */}
      <header className="dp-header">
        <div className="dp-brand">
          <div className="dp-logo" style={{ background: "#2563eb" }}><Truck size={20} /></div>
          <span>Logistics Control Center</span>
        </div>
      </header>

      <main className="dp-main">
        
        <div className="dp-stats-grid">
          <div className="dp-stat-card">
            <div className="dp-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><Package size={24} /></div>
            <div><p>Awaiting Dispatch</p><h3>{pendingDispatch}</h3></div>
          </div>
          <div className="dp-stat-card">
            <div className="dp-stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}><Truck size={24} /></div>
            <div><p>In Transit</p><h3>{inTransit}</h3></div>
          </div>
        </div>

        <h2 style={{ fontSize: "20px", marginTop: "32px", marginBottom: "16px" }}>Dispatch Queue</h2>
        
        {loading ? <p>Loading...</p> : orders.length === 0 ? (
          <p style={{ color: "#64748b" }}>No orders found.</p>
        ) : (
          <div className="dp-grid">
            {orders.map((order, index) => {
              const oId = order.orderId || order.id || order._id || `ORD-${index}`;
              const status = String(order.status || "").toUpperCase();
              const isShipped = status === "SHIPPED";
              
              const customerName = getCustomerName(order);
              const cityState = getCityState(order);
              let orderItems = order.items || order.orderItems || order.cartItems || order.products || [];
              
              const currentDetails = dispatchDetails[oId] || {};

              return (
                <div key={oId} className="dp-card" style={{ borderLeft: `4px solid ${isShipped ? '#16a34a' : '#2563eb'}` }}>
                  
                  <div className="dp-card-header">
                    <div>
                      <h4>JCS-{String(oId).slice(-8)}</h4>
                      <p style={{ fontWeight: "bold", color: "#0f172a", marginTop: "4px", fontSize: "15px" }}>{customerName}</p>
                      
                      {cityState && (
                        <p style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "#64748b", marginTop: "4px" }}>
                          <MapPin size={14} style={{ marginTop: "2px", flexShrink: 0 }} /> 
                          <span>{cityState}</span>
                        </p>
                      )}
                    </div>
                    <span className="dp-badge" style={isShipped ? {background: '#dcfce7', color: '#16a34a'} : {background: '#eff6ff', color: '#2563eb'}}>
                      {status}
                    </span>
                  </div>

                  <div className="dp-items-box">
                    <div className="dp-items-title"><Package size={14} /> Items in Package:</div>
                    {Array.isArray(orderItems) && orderItems.length > 0 ? (
                      orderItems.map((item, idx) => {
                        const pId = item.productId || item._id || item.id;
                        const matchedProduct = products.find(p => (p._id || p.id) === pId || p.title === item.title);
                        const itemImage = item.image || (item.images && item.images[0]) || matchedProduct?.images?.[0] || matchedProduct?.image;

                        return (
                          <div key={idx} className="dp-item-row" style={{ borderBottom: idx !== orderItems.length - 1 ? "1px dashed #cbd5e1" : "none" }}>
                            <div className="dp-item-image">
                              {itemImage ? <img src={itemImage} alt="" /> : <Package size={16} style={{ margin: "12px", color: "#94a3b8" }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title || item.name || item.productName || "Product"}</div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>Qty: <strong style={{ color: "#2563eb" }}>{item.quantity || item.qty || 1}</strong></div>
                            </div>
                          </div>
                        );
                      })
                    ) : <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Items not listed.</p>}
                  </div>

                  <div className="dp-timeline">
                    <div className={`dp-timeline-step ${isShipped ? 'completed' : 'active'}`}>
                      <div className="dp-timeline-dot">{isShipped ? <CheckCircle2 size={12}/> : <div className="dot-inner" />}</div>
                      <div className="dp-timeline-content">
                        <strong>Origin Hub</strong>
                        <span>Hyderabad</span>
                      </div>
                    </div>
                    <div className={`dp-timeline-step ${isShipped ? 'active' : ''}`}>
                      <div className="dp-timeline-dot">{isShipped ? <Clock size={12} /> : <div className="dot-inner" style={{background: "#cbd5e1"}} />}</div>
                      <div className="dp-timeline-content">
                        <strong>In Transit</strong>
                        <span>To destination hub</span>
                      </div>
                    </div>
                    <div className="dp-timeline-step">
                      <div className="dp-timeline-dot"><div className="dot-inner" style={{background: "#cbd5e1"}} /></div>
                      <div className="dp-timeline-content">
                        <strong>Out for Delivery</strong>
                        <span>Local agent</span>
                      </div>
                    </div>
                  </div>

                  <div className="dp-card-footer">
                    {!isShipped ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <label className="dp-label">Select Delivery Partner</label>
                          <div className="dp-select-wrapper">
                            <select 
                              className="dp-select"
                              value={currentDetails.partner || ""}
                              onChange={(e) => handleDetailChange(oId, "partner", e.target.value)}
                            >
                              <option value="" disabled>Choose partner...</option>
                              <option value="BlueDart">BlueDart Express</option>
                              <option value="Delhivery">Delhivery</option>
                              <option value="DTDC">DTDC</option>
                            </select>
                            <ChevronDown size={16} className="dp-select-icon" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="dp-label">Tracking Number (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Enter AWB / Tracking ID" 
                            className="dp-input"
                            value={currentDetails.tracking || ""}
                            onChange={(e) => handleDetailChange(oId, "tracking", e.target.value)}
                          />
                        </div>

                        <button className="dp-btn primary" onClick={() => dispatchOrder(order)}>
                          <Send size={16} /> Dispatch to Hub
                        </button>
                      </div>
                    ) : (
                      <div className="dp-success-box">
                        <CheckCircle2 size={20} color="#16a34a" />
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold", color: "#16a34a", fontSize: "14px" }}>Currently In Transit</p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#15803d" }}>Handed over to Logistics Partner</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}