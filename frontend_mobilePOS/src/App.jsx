import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';


//import Orders from './pages/Orders';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

import AddOrder from './pages/AddOrder';


//import Stock from './pages/Stock';
import Inventory from './pages/Inventory';
import AddStock from './pages/AddStock';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';
import Discounts from './pages/Discounts';
import { POSProvider } from './context/POSContext';
import { BranchProvider } from './context/BranchContext';
import { StoreProvider } from './context/StoreContext';

export default function App() {
  return (
    <POSProvider>
      <BranchProvider>
      <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
    
            <Route path="/orders" element={<Expenses />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/add-order" element={<AddOrder />} />
            
           
            
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add-stock" element={<AddStock />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>
        </Routes>
      </Router>
      </StoreProvider>
      </BranchProvider>
    </POSProvider>
  );
}
