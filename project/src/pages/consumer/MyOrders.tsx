import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Package, Star, X } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

interface Order {
  id: string;
  farmerId?: string;
  productName?: string;
  farmerName: string;
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
  totalAmount?: number;
  productAmount?: number;
  deliveryFee?: number;
  items?: OrderItem[];
  status: 'pending' | 'delivered' | 'cancelled';
  deliveryStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryAddress?: string;
  hasConsumerRating?: boolean;
  createdAt: Date;
}

const MyOrders = () => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userData]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), where('consumerId', '==', userData?.uid));
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

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledAt: new Date(),
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'cancelled' as const } : order
        )
      );
      toast.success('Order cancelled');
    } catch (error) {
      toast.error('Failed to cancel order');
      console.error(error);
    }
  };

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

  const getEffectiveOrderStatus = (order: Order) => {
    if (order.status === 'pending' && order.deliveryStatus === 'delivered') {
      return 'delivered';
    }

    return order.status;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // Handle both old and new order formats
              const hasItems = order.items && order.items.length > 0;
              const displayName = hasItems 
                ? `${order.items!.length} item${order.items!.length > 1 ? 's' : ''}`
                : order.productName || 'Order';
              const totalCost = order.totalAmount || order.totalPrice || 0;
              const effectiveStatus = getEffectiveOrderStatus(order);
              
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
                          <p className="text-sm text-gray-600">from {order.farmerName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Ordered on{' '}
                            {order.createdAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          {order.deliveryAddress && (
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {order.deliveryAddress}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            effectiveStatus
                          )}`}
                        >
                          {effectiveStatus}
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

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {!hasItems && order.quantity && (
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">{order.quantity} kg</p>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div>
                            <p className="text-sm text-gray-600">Payment</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {order.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                        {order.paymentStatus && (
                          <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <p className={`font-medium capitalize ${
                              order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {order.paymentStatus}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="text-lg font-bold text-green-600">
                            ${totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 whitespace-nowrap">
                      {effectiveStatus === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          <X className="w-5 h-5" />
                          Cancel Order
                        </button>
                      )}

                      {effectiveStatus === 'delivered' && !order.hasConsumerRating && (
                        <Link
                          to={`/consumer/rate?orderId=${order.id}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          <Star className="w-5 h-5" />
                          Rate Farmer
                        </Link>
                      )}

                      {effectiveStatus === 'delivered' && order.hasConsumerRating && (
                        <span className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg font-semibold">
                          <Star className="w-5 h-5" />
                          Rated
                        </span>
                      )}
                    </div>
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

export default MyOrders;
