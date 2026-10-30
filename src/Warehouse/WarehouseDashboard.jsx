import { useState, useEffect } from "react";
import { Box, Package, CheckCircle2, Truck, ClipboardList, AlertCircle, MapPin, X } from "lucide-react";
import { fetchAllOrders, fetchAllProducts, updateOrderStatus } from "../logisticsApi"; 
import toast from "react-hot-toast";
import "./Warehouse.css";

export default function WarehouseDashboard() {
  const [activeTab, setActiveTab] = useState("orders"); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForAddress, setSelectedOrderForAddress] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [loadedOrders, loadedProducts] = await Promise.all([
          fetchAllOrders(),
          fetchAllProducts()
        ]);
        setOrders(loadedOrders);
        setProducts(loadedProducts);
      } catch (err) {
        toast.error("Failed to load warehouse data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const markAsPacked = async (order) => {
    const orderId = order.orderId || order._id || order.id;
    
    try {
      // 1. Send request to the database to update the status
      await updateOrderStatus(orderId, "PROCESSING");
      
      // 2. If successful, update the UI state
      setOrders(prev => prev.map(o => {
        const currentId = o.orderId || o._id || o.id;
        return currentId === orderId ? { ...o, status: "PROCESSING" } : o;
      }));
      
      toast.success("Order saved to database and marked as Packed!");
    } catch (err) {
      toast.error("Failed to save status to the database.");
    }
  };

  const getCustomerName = (order) => {
    return order.shippingAddress?.name || order.address?.name || order.user_name || order.customerName || order.user?.name || order.buyer?.name || order.User?.name || order.customer?.name || "Customer";
  };

  const getCity = (order) => {
    return order.shippingAddress?.city || order.shippingAddress?.address || order.address?.city || order.address?.address || order.user?.address?.city || order.user?.address || order.buyer?.address || order.city || order.shippingCity;
  };

  const filteredOrders = orders;

  const pendingPack = orders.filter(o => ["PENDING", "PAID", "PLACED", "CONFIRMED", ""].includes(String(o.status || "PENDING").toUpperCase())).length;
  const readyForDispatch = orders.filter(o => ["PROCESSING", "PACKED"].includes(String(o.status || "").toUpperCase())).length;
  const shipped = orders.filter(o => ["SHIPPED", "DISPATCHED", "DELIVERED", "HUB_1", "HUB_2"].includes(String(o.status || "").toUpperCase())).length;

  return (
    <div className="wh-layout">
      
      {selectedOrderForAddress && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Shipping Data</h3>
              <button onClick={() => setSelectedOrderForAddress(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <pre style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(selectedOrderForAddress.shippingAddress || selectedOrderForAddress.address || selectedOrderForAddress.user?.address || "No address object found", null, 2)}
            </pre>
          </div>
        </div>
      )}

      <header className="wh-header">
        <div className="wh-brand">
          <div className="wh-logo" style={{ background: "#f59e0b" }}><Box size={20} /></div>
          <span>Warehouse Operations</span>
        </div>
      </header>

      <main className="wh-main">
        
        <div className="wh-tabs">
          <button className={`wh-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={16} /> All Orders
          </button>
          <button className={`wh-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={16} /> Full Inventory
          </button>
        </div>

        {activeTab === "orders" && (
          <div className="animate-fade-in">
            <div className="wh-stats-grid">
              <div className="wh-stat-card">
                <div className="wh-stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}><AlertCircle size={24} /></div>
                <div><p>Needs Packing</p><h3>{pendingPack}</h3></div>
              </div>
              <div className="wh-stat-card">
                <div className="wh-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><CheckCircle2 size={24} /></div>
                <div><p>Packed (Awaiting Pickup)</p><h3>{readyForDispatch}</h3></div>
              </div>
              <div className="wh-stat-card">
                <div className="wh-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><Truck size={24} /></div>
                <div><p>In Transit / Shipped</p><h3>{shipped}</h3></div>
              </div>
            </div>

            {loading ? <p>Loading orders...</p> : filteredOrders.length === 0 ? (
              <p style={{ marginTop: "24px", color: "#64748b" }}>No orders found.</p>
            ) : (
              <div className="wh-grid" style={{ marginTop: "24px" }}>
                {filteredOrders.map((order, index) => {
                  const oId = order.orderId || order.id || order._id || `ORD-${index}`;
                  const status = String(order.status || "PENDING").toUpperCase();
                  
                  const isPacked = ["PACKED", "PROCESSING"].includes(status);
                  const isShipped = ["SHIPPED", "DISPATCHED", "DELIVERED", "HUB_1", "HUB_2"].includes(status);
                  const canPack = !isPacked && !isShipped;
                  const borderColor = isShipped ? "#2563eb" : isPacked ? "#16a34a" : "#f59e0b";
                  const badgeClass = isShipped ? "dispatch" : isPacked ? "instock" : "low";
                  
                  const customerName = getCustomerName(order);
                  const cityName = getCity(order);
                  
                  let orderItems = order.items || order.orderItems || order.cartItems || order.products || [];
                  
                  return (
                    <div key={oId} className="wh-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                      
                      <div className="wh-card-header">
                        <div>
                          <h4>JCS-{String(oId).slice(-8)}</h4>
                          <p style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            {customerName} • {cityName ? cityName : (
                              <button 
                                onClick={() => setSelectedOrderForAddress(order)}
                                style={{ background: "none", border: "none", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "12px", padding: 0 }}
                              >
                                <MapPin size={12} /> View Address
                              </button>
                            )}
                          </p>
                        </div>
                        <span className={`wh-badge ${badgeClass}`} style={isShipped ? {background: '#dbeafe', color: '#1d4ed8'} : {}}>
                          {status}
                        </span>
                      </div>

                      <div className="wh-card-body">
                        <strong>Items to Pick:</strong>
                        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {Array.isArray(orderItems) && orderItems.length > 0 ? (
                            orderItems.map((item, idx) => {
                              const pId = item.productId || item._id || item.id;
                              const matchedProduct = products.find(p => (p._id || p.id) === pId || p.title === item.title);
                              const itemImage = item.image || (item.images && item.images[0]) || matchedProduct?.images?.[0] || matchedProduct?.image;

                              return (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "8px", borderRadius: "6px", fontSize: "13px" }}>
                                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#e2e8f0", overflow: "hidden", flexShrink: 0 }}>
                                    {itemImage ? <img src={itemImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={16} style={{ margin: "12px", color: "#94a3b8" }} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{item.title || item.name || item.productName || "Product"}</div>
                                    <div style={{ color: "#64748b", fontSize: "12px" }}>Qty: {item.quantity || item.qty || 1}</div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px", fontSize: "13px", color: "#64748b" }}>
                              {order.productName || order.productTitle || "Items not listed in detail."}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="wh-card-actions">
                        {canPack ? (
                          <button className="wh-btn primary" onClick={() => markAsPacked(order)}>
                            <Package size={16} /> Mark as Packed
                          </button>
                        ) : isPacked ? (
                          <button className="wh-btn success" disabled style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #16a34a" }}>
                            <CheckCircle2 size={16} /> Ready for Dispatch
                          </button>
                        ) : (
                          <button className="wh-btn" disabled style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #2563eb" }}>
                            <Truck size={16} /> In Transit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="animate-fade-in">
            {loading ? <p>Loading inventory...</p> : products.length === 0 ? (
              <div style={{ marginTop: "24px", padding: "40px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Package size={48} style={{ margin: "0 auto 16px", color: "#cbd5e1" }} />
                <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>No products loaded</h3>
              </div>
            ) : (
              <div className="wh-grid" style={{ marginTop: "24px" }}>
                {products.map((product, index) => {
                  const pId = product._id || product.id || `PROD-${index}`;
                  const stock = Number(product.stock) || 0;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= 5;
                  const image = product.images?.[0] || product.image;

                  return (
                    <div key={pId} className="wh-card" style={{ borderLeft: `4px solid ${isOut ? '#dc2626' : isLow ? '#f59e0b' : '#16a34a'}` }}>
                      <div className="wh-card-header">
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                          <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "#e2e8f0", overflow: "hidden", flexShrink: 0 }}>
                            {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={24} style={{ margin: "18px", color: "#94a3b8" }} />}
                          </div>
                          <div>
                            <h4>{product.title || product.name || "Unnamed Product"}</h4>
                            <p>{product.brand || "No Brand"} • SKU: {product.sku || "N/A"}</p>
                          </div>
                        </div>
                        <span className={`wh-badge ${isOut ? 'out' : isLow ? 'low' : 'instock'}`}>
                          {isOut ? "Out" : isLow ? "Low" : "In Stock"}
                        </span>
                      </div>
                      
                      <div className="wh-card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>Stock:</strong>
                          <p style={{ fontSize: "20px", fontWeight: "800", color: isOut ? "#dc2626" : "#0f172a", margin: "4px 0 0 0" }}>
                            {stock} units
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <strong>Price:</strong>
                          <p style={{ fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>₹{Number(product.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}