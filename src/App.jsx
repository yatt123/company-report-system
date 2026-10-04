import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import PurchaseOrders from "./pages/PurchaseOrders";
import PODetail from "./pages/PODetail";
import Production from "./pages/Production";
import QC from "./pages/QC";
import Delivery from "./pages/Delivery";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import InputPO from "./pages/InputPO";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>

          {/* DASHBOARD */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* PURCHASE ORDERS */}
          <Route
            path="/purchase-orders"
            element={<PurchaseOrders />}
          />

          <Route
            path="/purchase-orders/new"
            element={<InputPO />}
          />

          <Route
            path="/purchase-orders/:id"
            element={<PODetail />}
          />

          {/* PRODUCTION */}
          <Route
            path="/production"
            element={<Production />}
          />

          {/* QUALITY CONTROL */}
          <Route
            path="/qc"
            element={<QC />}
          />

          {/* DELIVERY */}
          <Route
            path="/delivery"
            element={<Delivery />}
          />

          {/* CUSTOMERS */}
          <Route
            path="/customers"
            element={<Customers />}
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;