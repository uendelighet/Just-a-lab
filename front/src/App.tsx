import { Routes, Route } from "react-router-dom";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ConsumerDashboard } from "./pages/consumer/ConsumerDashboard";
import { StoreDashboard } from "./pages/store/StoreDashboard";
import { DeliveryDashboard } from "./pages/delivery/DeliveryDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/consumer" element={<ConsumerDashboard />} />
      <Route path="/store" element={<StoreDashboard />} />
      <Route path="/delivery" element={<DeliveryDashboard />} />
    </Routes>
  );
}

export default App;