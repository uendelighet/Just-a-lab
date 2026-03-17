import { supabase } from "../config/supabase.js";

export const register = async (req, res) => {
  const { name, email, password, role, store_name } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["consumer", "store", "delivery"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (role === "store" && !store_name) {
    return res.status(400).json({ error: "store_name is required" });
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    role,
    full_name: name,
  });

  if (profileError) return res.status(500).json({ error: profileError.message });

  if (role === "store") {
    const { error: storeError } = await supabase.from("stores").insert({
      name: store_name,
      user_id: userId,
      is_open: false,
    });

    if (storeError) return res.status(500).json({ error: storeError.message });
  }

  return res.status(201).json({ message: "User registered successfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: "Invalid credentials" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return res.json({
    session: data.session,
    role: profile.role,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile.full_name,
      role: profile.role,
    },
  });
};