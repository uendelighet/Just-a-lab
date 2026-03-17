import { supabase } from "../config/supabase.js";

export const getProductsByStore = async (req, res) => {
  const { storeId } = req.params;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createProduct = async (req, res) => {
  const { name, price, store_id } = req.body;
  if (!name || price == null || !store_id) {
    return res.status(400).json({ error: "name, price and store_id are required" });
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", store_id)
    .eq("user_id", req.user.id)
    .single();

  if (!store) return res.status(403).json({ error: "Store not found or not yours" });

  const { data, error } = await supabase
    .from("products")
    .insert({ name, price, store_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", id)
    .single();
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", product.store_id)
    .eq("user_id", req.user.id)
    .single();
  if (!store) return res.status(403).json({ error: "Unauthorized" });

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Product deleted" });
};