import Layout from "./components/Layout";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddOrder from "./pages/AddOrder";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import InsightsPage from "./pages/Insights";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/addOrder" element={<AddOrder />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;