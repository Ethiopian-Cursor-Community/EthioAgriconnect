import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Package, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Delivery {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  farmerName: string;
  consumerName: string;
  assignedAt: any;
  deliveredAt?: any;
  pickedUpAt?: any;
  rejectionReason?: string;
}

const DeliveryHistory = () => {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchDeliveryHistory();
  }, [userData]);

  const fetchDeliveryHistory = async () => {
    try {
      const q = query(
        collection(db, 'deliveries'),
        where('deliveryManId', '==', userData?.uid),
        where('status', 'in', ['delivered', 'cancelled', 'rejected'])
      );

      const snapshot = await getDocs(q);
      const deliveriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Delivery[];

      deliveriesData.sort((a, b) => {
        const dateA = a.deliveredAt?.toDate() || a.assignedAt?.toDate();
        const dateB = b.deliveredAt?.toDate() || b.assignedAt?.toDate();
        return dateB - dateA;
      });

      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Failed to fetch delivery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryTime = (delivery: Delivery) => {
    if (!delivery.pickedUpAt || !delivery.deliveredAt) return 'N/A';
    const pickupTime = delivery.pickedUpAt.toDate().getTime();
    const deliveryTime = delivery.deliveredAt.toDate().getTime();
    const minutes = Math.round((deliveryTime - pickupTime) / 60000);
    return `${minutes} min`;
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesFilter = filter === 'all' || delivery.status === filter;
    const matchesSearch =
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.consumerName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const deliveryDate = (delivery.deliveredAt || delivery.assignedAt)?.toDate();
      if (dateRange.start) {
        matchesDate = matchesDate && deliveryDate >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && deliveryDate <= new Date(dateRange.end);
      }
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: any }> = {
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: XCircle },
      rejected: { color: 'bg-orange-100 text-orange-800', text: 'Rejected', icon: XCircle },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status, icon: Package };
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Product', 'Quantity', 'Price', 'Status', 'Farmer', 'Consumer', 'Date', 'Delivery Time'];
    const rows = filteredDeliveries.map((d) => [
      d.orderId,
      d.productName,
      d.quantity,
      d.totalPrice,
      d.status,
      d.farmerName,
      d.consumerName,
      (d.deliveredAt || d.assignedAt)?.toDate().toLocaleDateString(),
      calculateDeliveryTime(d),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery History</h1>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Export to CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {deliveries.filter((d) => d.status === 'delivered').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Cancelled</p>
            <p className="text-3xl font-bold text-red-600">
              {deliveries.filter((d) => d.status === 'cancelled').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Rejected</p>
            <p className="text-3xl font-bold text-orange-600">
              {deliveries.filter((d) => d.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No delivery history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order #{delivery.orderId}</h3>
                    <p className="text-gray-600 mt-1">
                      {delivery.productName} ({delivery.quantity} kg)
                    </p>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {(delivery.deliveredAt || delivery.assignedAt)?.toDate().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Delivery Time: {calculateDeliveryTime(delivery)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Farmer</p>
                    <p className="font-medium text-gray-900">{delivery.farmerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consumer</p>
                    <p className="font-medium text-gray-900">{delivery.consumerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-bold text-gray-900">${delivery.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {delivery.rejectionReason && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Rejection Reason:</strong> {delivery.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DeliveryHistory;
