import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import BillReceipt from '../components/BillReceipt';

export default function ReceiptPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const orderData = searchParams.get('data');
  let order = null;
  try {
    order = orderData ? JSON.parse(decodeURIComponent(orderData)) : null;
  } catch (error) {
    console.error('Invalid receipt data', error);
  }

  if (!order?.cart?.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">No receipt data found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-[#0492C2] hover:underline"
        >
          Return to POS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <BillReceipt 
        order={order}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
