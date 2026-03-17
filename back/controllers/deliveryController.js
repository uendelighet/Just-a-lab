import { supabase } from "../config/supabase.js";

export const getAvailableOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      stores ( name ),
      order_items ( quantity, products ( name, price ) )
    `)
    .eq("status", "pending")
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getAcceptedOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      stores ( name ),
      order_items ( quantity, products ( name, price ) )
    `)
    .eq("delivery_id", req.user.id)
    .in("status", ["accepted", "delivered"])
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const acceptOrder = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "accepted", delivery_id: req.user.id })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Order not found or already taken" });
  res.json(data);
};

export const declineOrder = async (req, res) => {
  res.json({ message: "Order declined" });
};