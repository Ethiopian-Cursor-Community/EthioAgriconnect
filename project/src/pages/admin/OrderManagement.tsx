import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { ShoppingBag, X, Search, Filter } from 'lucide-react';

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
  productId?: string;
  farmerName: string;
  farmerId: string;
  consumerName?: string;
  consumerId: string;
  buyerName?: string;
  buyerEmail?: string;
  quantity?: number;
  pricePerUnit?: number;
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

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Order[];
      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setFilteredOrders(ordersData);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((o) => {
        const productName = o.productName || '';
        const farmerName = o.farmerName || '';
        const consumerName = o.consumerName || o.buyerName || '';
        const buyerEmail = o.buyerEmail || '';
        
        return (
          productName.toLowerCase().includes(query) ||
          farmerName.toLowerCase().includes(query) ||
          consumerName.toLowerCase().includes(query) ||
          buyerEmail.toLowerCase().includes(query)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
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
      toast.success('Order cancelled successfully');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage all platform orders</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2">
              {['all', 'pending', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                    statusFilter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const hasItems = order.items && order.items.length > 0;
              const displayName = hasItems 
                ? `${order.items!.length} item${order.items!.length > 1 ? 's' : ''}`
                : order.productName || 'Order';
              const customerName = order.consumerName || order.buyerName || 'Customer';
              const customerEmail = order.buyerEmail || '';
              const totalCost = order.totalAmount || order.totalPrice || 0;
              
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Farmer</p>
                          <p className="font-medium text-gray-900">{order.farmerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium text-gray-900">{customerName}</p>
                          {customerEmail && (
                            <p className="text-sm text-gray-600">{customerEmail}</p>
                          )}
                          {order.deliveryPhone && (
                            <p className="text-sm text-gray-600">📞 {order.deliveryPhone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Details</p>
                          {!hasItems && order.quantity && (
                            <p className="font-medium text-gray-900">Quantity: {order.quantity} kg</p>
                          )}
                          {order.paymentMethod && (
                            <p className="text-sm text-gray-600 capitalize">
                              Payment: {order.paymentMethod.replace('_', ' ')}
                            </p>
                          )}
                          {order.paymentStatus && (
                            <p className={`text-sm font-medium ${
                              order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              Status: {order.paymentStatus}
                            </p>
                          )}
                          <p className="text-lg font-bold text-green-600 mt-1">
                            Total: ${totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition whitespace-nowrap"
                      >
                        <X className="w-5 h-5" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderManagement;

