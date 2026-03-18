import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BASE = "https://just-a-labback.vercel.app";interface Product { id: string; name: string; price: number; }
interface CartItem { product_id: string; name: string; quantity: number; }
interface Order { order_id: string; product_name: string; quantity: number; status: string; }

export const ConsumerDashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const headers = { Authorization: `Bearer ${token}` };

  const getStores = async () => {
    const res = await fetch(`${BASE}/stores`, { headers });
    const data = await res.json();
    setStores(data.filter((s: Store) => s.is_open));
  };

  const getProducts = async (storeId: string) => {
    const res = await fetch(`${BASE}/products/store/${storeId}`, { headers });
    const data = await res.json();
    setProducts(data);
  };

  const getOrders = async () => {
    const res = await fetch(`${BASE}/orders/consumer/${user?.id}`, { headers });
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    getStores();
    getOrders();
  }, []);

  const selectStore = (store: Store) => {
    setSelectedStore(store);
    setCart([]);
    getProducts(store.id);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((i) => i.product_id === product.id);
    if (existing) {
      setCart(cart.map((i) =>
        i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { product_id: product.id, name: product.name, quantity: 1 }]);
    }
  };

  const decreaseQty = (productId: string) => {
    setCart(cart.map((i) =>
      i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i
    ).filter((i) => i.quantity > 0));
  };

  const removeItem = (productId: string) => {
    setCart(cart.filter((i) => i.product_id !== productId));
  };

  const createOrder = async () => {
    await fetch(`${BASE}/orders`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ store_id: selectedStore?.id, items: cart }),
    });
    setCart([]);
    setSelectedStore(null);
    setProducts([]);
    getOrders();
  };

  const deleteOrder = async (orderId: string) => {
    await fetch(`${BASE}/orders/${orderId}`, { method: "DELETE", headers });
    getOrders();
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>

      {!selectedStore ? (
        <>
          <h2>Open Stores</h2>
          {stores.length === 0 && <p>No open stores right now</p>}
          {stores.map((store) => (
            <div key={store.id}>
              <span>{store.name}</span>
              <button onClick={() => selectStore(store)}>View Products</button>
            </div>
          ))}
        </>
      ) : (
        <>
          <button onClick={() => { setSelectedStore(null); setProducts([]); }}>← Back to Stores</button>
          <h2>{selectedStore.name} — Products</h2>
          {products.map((p) => (
            <div key={p.id}>
              <span>{p.name} — ${p.price}</span>
              <button onClick={() => addToCart(p)}>Add</button>
            </div>
          ))}

          <h3>Cart</h3>
          {cart.length === 0 && <p>Empty cart</p>}
          {cart.map((item) => (
            <div key={item.product_id}>
              <span>{item.name}</span>
              <button onClick={() => decreaseQty(item.product_id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => addToCart({ id: item.product_id, name: item.name, price: 0 })}>+</button>
              <button onClick={() => removeItem(item.product_id)}>Remove</button>
            </div>
          ))}
          {cart.length > 0 && <button onClick={createOrder}>Place Order</button>}
        </>
      )}

      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders yet</p>}
      {orders.map((order, i) => (
        <div key={i}>
          <span>{order.product_name} x{order.quantity} — {order.status}</span>
          {order.status === "pending" && (
            <button onClick={() => deleteOrder(order.order_id)}>Cancel</button>
          )}
        </div>
      ))}
    </div>
  );
};