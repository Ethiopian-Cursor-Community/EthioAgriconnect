import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DeliveryAIChatbot from '../../components/DeliveryAIChatbot';
import { Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  todayDeliveries: number;
  avgDeliveryTime: number;
}

interface RecentDelivery {
  id: string;
  orderId: string;
  productName: string;
  status: string;
  deliveredAt?: Date;
}

const DeliveryDashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    todayDeliveries: 0,
    avgDeliveryTime: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      const q = query(
        collection(db, 'deliveries'),
        where('deliveryManId', '==', userData?.uid)
      );
      const snapshot = await getDocs(q);
      const deliveries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const total = deliveries.length;
      const pending = deliveries.filter((d: any) => 
        ['assigned', 'accepted', 'picked_up', 'on_the_way'].includes(d.status)
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = deliveries.filter((d: any) => {
        const deliveredAt = d.deliveredAt?.toDate();
        return deliveredAt && deliveredAt >= today;
      }).length;

      const completedDeliveries = deliveries.filter((d: any) => 
        d.status === 'delivered' && d.pickedUpAt && d.deliveredAt
      );
      
      let avgTime = 0;
      if (completedDeliveries.length > 0) {
        const totalTime = completedDeliveries.reduce((sum: number, d: any) => {
          const pickupTime = d.pickedUpAt?.toDate().getTime();
          const deliveryTime = d.deliveredAt?.toDate().getTime();
          return sum + (deliveryTime - pickupTime);
        }, 0);
        avgTime = Math.round(totalTime / completedDeliveries.length / 60000); // Convert to minutes
      }

      setStats({
        totalDeliveries: total,
        pendingDeliveries: pending,
        todayDeliveries: todayCount,
        avgDeliveryTime: avgTime,
      });

      const recent = deliveries
        .filter((d: any) => d.status === 'delivered')
        .sort((a: any, b: any) => b.deliveredAt?.toDate() - a.deliveredAt?.toDate())
        .slice(0, 5)
        .map((d: any) => ({
          id: d.id,
          orderId: d.orderId,
          productName: d.productName,
          status: d.status,
          deliveredAt: d.deliveredAt?.toDate(),
        }));

      setRecentDeliveries(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.todayDeliveries}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Time</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgDeliveryTime}m</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/delivery/assigned"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md p-8 hover:shadow-lg transition transform hover:scale-105"
          >
            <h3 className="text-2xl font-bold mb-2">View Assigned Deliveries</h3>
            <p className="text-green-100">Manage your active delivery assignments</p>
          </Link>

          <Link
            to="/delivery/history"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md p-8 hover:shadow-lg transition transform hover:scale-105"
          >
            <h3 className="text-2xl font-bold mb-2">View History</h3>
            <p className="text-blue-100">Check your past deliveries</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentDeliveries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent deliveries</p>
          ) : (
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Delivered Order #{delivery.orderId}
                      </p>
                      <p className="text-sm text-gray-600">{delivery.productName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {delivery.deliveredAt?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <DeliveryAIChatbot />
    </div>
  );
};

export default DeliveryDashboard;
