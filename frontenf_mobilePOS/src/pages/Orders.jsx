import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import AddOrder from './AddOrder';

const orderStatuses = ['All', 'Pending', 'Processing', 'Ready for Pickup', 'Completed', 'Cancelled'];

const mobileOrders = [
  {
    id: 1,
    customerName: 'John Doe',
    orderTime: '2024-01-20T10:30:00',
    items: ['iPhone 15 Pro (256GB)', 'AirPods Pro'],
    totalAmount: 345000.00,
    status: 'Completed',
    type: 'purchase',
    paymentMethod: 'card',
    imei: '356938035643809'
  },
  {
    id: 2,
    customerName: 'Mobile Care Center',
    orderTime: '2024-01-20T11:00:00',
    items: ['Samsung S23 Screen Replacement'],
    totalAmount: 25000.00,
    status: 'Processing',
    type: 'repair',
    deviceModel: 'Samsung Galaxy S23',
    imei: '357292080746771'
  }
];

export default function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState(mobileOrders);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Ready for Pickup': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <ClockIcon className="w-5 h-5" />;
      case 'Processing': return <CogIcon className="w-5 h-5" />;
      case 'Ready for Pickup': return <TruckIcon className="w-5 h-5" />;
      case 'Completed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'Cancelled': return <XCircleIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getOrderTypeIcon = (type) => {
    return type === 'purchase' ? (
      <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
    ) : (
      <WrenchScrewdriverIcon className="w-5 h-5 text-green-600" />
    );
  };

  const getOrderLocation = (order) => {
    return order.type === 'purchase' ? 
      `IMEI: ${order.imei || 'N/A'}` : 
      `Device: ${order.deviceModel || 'N/A'}`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-lg font-semibold">Orders</h1>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search orders..."
            className="input-field pl-10 pr-4 py-1 text-sm w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex justify-start overflow-x-auto gap-2 pb-2">
        {orderStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status.toLowerCase())}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border-2 text-sm ${
              filterStatus === status.toLowerCase()
                ? 'bg-[#0492C2] text-white border-[#0492C2]'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-[#0492C2]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-2 py-2">#{order.id}</td>
                <td className="px-2 py-2 font-medium">{order.customerName}</td>
                <td className="px-2 py-2">{order.items.join(', ')}</td>
                <td className="px-2 py-2">LKR {order.totalAmount.toFixed(2)}</td>
                <td className="px-2 py-2">
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      onClick={() => setEditOrder(order)}
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editOrder && (
        <AddOrder
          open={true}
          onClose={() => setEditOrder(null)}
          order={editOrder}
          onAddOrder={(updatedOrder) => {
            setOrders(orders.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            ));
            setEditOrder(null);
          }}
        />
      )}
    </div>
  );
}
