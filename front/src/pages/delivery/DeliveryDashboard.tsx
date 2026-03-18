import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BASE = "https://just-a-labback-ahhnq3tyf-uendelighets-projects.vercel.app";

interface OrderItem { quantity: number; products: { name: string; price: number; }; }
interface Order { id: string; status: string; stores: { name: string; }; order_items: OrderItem[]; }

export const DeliveryDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [available, setAvailable] = useState<Order[]>([]);
  const [accepted, setAccepted] = useState<Order[]>([]);

  const headers = { Authorization: `Bearer ${token}` };

  const getAvailable = async () => {
    const res = await fetch(`${BASE}/delivery/orders/available`, { headers });
    setAvailable(await res.json());
  };

  const getAccepted = async () => {
    const res = await fetch(`${BASE}/delivery/orders/accepted`, { headers });
    setAccepted(await res.json());
  };

  useEffect(() => {
    getAvailable();
    getAccepted();
  }, []);

  const acceptOrder = async (id: string) => {
    await fetch(`${BASE}/delivery/orders/${id}/accept`, { method: "POST", headers });
    getAvailable();
    getAccepted();
  };

  const declineOrder = async (id: string) => {
    await fetch(`${BASE}/delivery/orders/${id}/decline`, { method: "POST", headers });
    getAvailable();
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Available Orders</h2>
      {available.length === 0 && <p>No available orders</p>}
      {available.map((order) => (
        <div key={order.id}>
          <p>Order #{order.id} — Store: {order.stores?.name}</p>
          {order.order_items?.map((item, i) => (
            <p key={i}>• {item.products?.name} x{item.quantity}</p>
          ))}
          <button onClick={() => acceptOrder(order.id)}>Accept</button>
          <button onClick={() => declineOrder(order.id)}>Decline</button>
        </div>
      ))}

      <h2>My Accepted Orders</h2>
      {accepted.length === 0 && <p>No accepted orders yet</p>}
      {accepted.map((order) => (
        <div key={order.id}>
          <p>Order #{order.id} — {order.status} — Store: {order.stores?.name}</p>
          {order.order_items?.map((item, i) => (
            <p key={i}>• {item.products?.name} x{item.quantity}</p>
          ))}
        </div>
      ))}
    </div>
  );
};