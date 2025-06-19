import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import Orders from './pages/Orders';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Discounts from './pages/Discounts';
import AddOrder from './pages/AddOrder';
import ReceiptPage from './pages/ReceiptPage';
import GRN from './pages/GRN';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/add" element={<AddItem />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/grn" element={<GRN />} />
        </Route>
      </Routes>
    </Router>
  );
}
