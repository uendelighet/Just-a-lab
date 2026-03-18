import { useEffect, useState, type FormEvent } from "react";import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BASE = "https://just-a-labback.vercel.app";

interface Store { id: string; name: string; is_open: boolean; }
interface Product { id: string; name: string; price: number; }
interface OrderItem { quantity: number; products: { name: string; price: number; }; }
interface Order { id: string; status: string; consumer_id: string; order_items: OrderItem[]; }

export const StoreDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ name: "", price: "" });

  const headers = { Authorization: `Bearer ${token}` };

  const getStore = async () => {
    const res = await fetch(`${BASE}/stores`, { headers });
    const data = await res.json();
    const mine = data.find((s: Store & { user_id: string }) => s.user_id === user?.id);
    setStore(mine);
    if (mine) {
      getProducts(mine.id);
      getOrders(mine.id);
    }
  };

  const getProducts = async (storeId: string) => {
    const res = await fetch(`${BASE}/products/store/${storeId}`, { headers });
    setProducts(await res.json());
  };

  const getOrders = async (storeId: string) => {
    const res = await fetch(`${BASE}/orders/store/${storeId}`, { headers });
    setOrders(await res.json());
  };

  useEffect(() => { getStore(); }, []);

  const toggleStore = async () => {
    if (!store) return;
    const endpoint = store.is_open ? "close" : "open";
    await fetch(`${BASE}/stores/${store.id}/${endpoint}`, { method: "PATCH", headers });
    setStore({ ...store, is_open: !store.is_open });
  };

  const createProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!store) return;
    await fetch(`${BASE}/products`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, price: Number(form.price), store_id: store.id }),
    });
    setForm({ name: "", price: "" });
    getProducts(store.id);
  };

  const deleteProduct = async (id: string) => {
    await fetch(`${BASE}/products/${id}`, { method: "DELETE", headers });
    if (store) getProducts(store.id);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div>
      <h1>{store?.name} Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <h2>Store Status: {store?.is_open ? "🟢 Open" : "🔴 Closed"}</h2>
      <button onClick={toggleStore}>{store?.is_open ? "Close Store" : "Open Store"}</button>
      <h2>Create Product</h2>
      <form onSubmit={createProduct}>
        <input placeholder="Product name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="Price" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button type="submit">Create</button>
      </form>
      <h2>Products</h2>
      {products.length === 0 && <p>No products yet</p>}
      {products.map((p) => (
        <div key={p.id}>
          <span>{p.name} — ${p.price}</span>
          <button onClick={() => deleteProduct(p.id)}>Delete</button>
        </div>
      ))}
      <h2>Incoming Orders</h2>
      {orders.length === 0 && <p>No orders yet</p>}
      {orders.map((order) => (
        <div key={order.id}>
          <p>Order #{order.id} — {order.status}</p>
          {order.order_items?.map((item, i) => (
            <p key={i}>• {item.products?.name} x{item.quantity}</p>
          ))}
        </div>
      ))}
    </div>
  );
};