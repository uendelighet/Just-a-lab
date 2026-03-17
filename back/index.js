import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import storesRoutes from "./routes/storesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/stores", storesRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/delivery", deliveryRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Rappi API running 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server on http://localhost:${PORT}`);
});