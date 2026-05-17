import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Package } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

interface Order {
  id: string;
  productName?: string;
  buyerName?: string;
  buyerEmail?: string;
  consumerName?: string;
  quantity?: number;
  totalPrice?: number;
  totalAmount?: number;
  productAmount?: number;
  deliveryFee?: number;
  items?: OrderItem[];
  deliveryAddress?: string;
  deliveryPhone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: Date;
}

const OrdersReceived = () => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userData]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), where('farmerId', '==', userData?.uid));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Order[];
      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delivery status is now managed by delivery personnel only

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders Received</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders from consumers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const hasItems = order.items && order.items.length > 0;
              const displayName = hasItems 
                ? `${order.items!.length} item${order.items!.length > 1 ? 's' : ''}`
                : order.productName || 'Order';
              const customerName = order.consumerName || order.buyerName || 'Customer';
              const totalCost = order.totalAmount || order.totalPrice || 0;
              const productRevenue = order.productAmount || order.totalPrice || 0;
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {displayName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order placed on{' '}
                            {order.createdAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Order Items */}
                      {hasItems && (
                        <div className="mb-4 space-y-2">
                          {order.items!.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="text-gray-700">
                                {item.productName} × {item.quantity}
                              </span>
                              <span className="font-medium text-gray-900">
                                ${item.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Customer Information</p>
                          <p className="font-medium text-gray-900">{customerName}</p>
                          {order.deliveryPhone && (
                            <p className="text-sm text-gray-600">📞 {order.deliveryPhone}</p>
                          )}
                          {order.deliveryAddress && (
                            <p className="text-sm text-gray-600">📍 {order.deliveryAddress}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Details</p>
                          {!hasItems && order.quantity && (
                            <p className="font-medium text-gray-900">Quantity: {order.quantity} kg</p>
                          )}
                          <p className="text-sm text-gray-600">
                            Product Revenue: ${productRevenue.toFixed(2)}
                          </p>
                          {order.deliveryFee && (
                            <p className="text-sm text-gray-600">
                              Delivery Fee: ${order.deliveryFee.toFixed(2)}
                            </p>
                          )}
                          <p className="text-lg font-bold text-green-600">
                            Total: ${totalCost.toFixed(2)}
                          </p>
                          {order.paymentMethod && (
                            <p className="text-sm text-gray-600 mt-1">
                              Payment: {order.paymentMethod.replace('_', ' ')}
                            </p>
                          )}
                          {order.paymentStatus && (
                            <p className={`text-sm font-medium mt-1 ${
                              order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              Payment: {order.paymentStatus}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery status is managed by delivery personnel */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrdersReceived;
