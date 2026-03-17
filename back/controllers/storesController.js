import { supabase } from "../config/supabase.js";

export const getAllStores = async (req, res) => {
  const { data, error } = await supabase.from("stores").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const openStore = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("stores")
    .update({ is_open: true })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Store not found or not yours" });
  res.json(data);
};

export const closeStore = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("stores")
    .update({ is_open: false })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Store not found or not yours" });
  res.json(data);
};