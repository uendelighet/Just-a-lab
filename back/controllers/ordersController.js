import { supabase } from "../config/supabase.js";

export const createOrder = async (req, res) => {
  const { store_id, items } = req.body;
  const consumer_id = req.user.id;

  if (!store_id || !items || items.length === 0) {
    return res.status(400).json({ error: "store_id and items[] are required" });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ consumer_id, store_id, status: "pending" })
    .select()
    .single();
  if (orderError) return res.status(500).json({ error: orderError.message });

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  res.status(201).json({ message: "Order created", order });
};

export const getOrdersByConsumer = async (req, res) => {
  const { consumerId } = req.params;

  if (req.user.id !== consumerId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      order_id,
      quantity,
      orders!inner ( id, status, store_id, consumer_id ),
      products ( name, price )
    `)
    .eq("orders.consumer_id", consumerId);

  if (error) return res.status(500).json({ error: error.message });

  const formatted = data.map((item) => ({
    order_id: item.order_id,
    product_name: item.products?.name,
    price: item.products?.price,
    quantity: item.quantity,
    status: item.orders?.status,
  }));

  res.json(formatted);
};

export const getOrdersByStore = async (req, res) => {
  const { storeId } = req.params;

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", req.user.id)
    .single();
  if (!store) return res.status(403).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      consumer_id,
      order_items ( quantity, products ( name, price ) )
    `)
    .eq("store_id", storeId)
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.consumer_id !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
  if (order.status !== "pending") return res.status(400).json({ error: "Only pending orders can be cancelled" });

  await supabase.from("order_items").delete().eq("order_id", id);
  await supabase.from("orders").delete().eq("id", id);

  res.json({ message: "Order cancelled" });
};