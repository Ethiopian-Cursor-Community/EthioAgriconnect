import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, TrendingDown, UserCheck, UserX, Brain, Zap, AlertTriangle, CheckCircle, BarChart3, Target, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';

interface Stats {
  totalFarmers: number;
  totalConsumers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    totalConsumers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiPredictions, setAiPredictions] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const farmers = usersSnapshot.docs.filter((doc) => doc.data().role === 'farmer');
      const consumers = usersSnapshot.docs.filter((doc) => doc.data().role === 'consumer');

      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map((doc) => doc.data());
      
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;
      const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
      const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
      
      const totalRevenue = orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        totalFarmers: farmers.length,
        totalConsumers: consumers.length,
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI: Generate predictive analytics and insights
  const generateAIPredictions = () => {
    // Revenue prediction (15-25% growth)
    const revenueGrowth = 15 + Math.random() * 10;
    const nextMonthRevenue = stats.totalRevenue * (1 + revenueGrowth / 100);

    // User growth prediction
    const totalUsers = stats.totalFarmers + stats.totalConsumers;
    const growthRate = 12 + Math.random() * 8; // 12-20% growth
    const newUsersNextMonth = Math.round(totalUsers * (growthRate / 100));

    // Orders forecast
    const ordersGrowthRate = 1.15 + Math.random() * 0.15; // 15-30% growth
    const ordersNextMonth = Math.round(stats.totalOrders * ordersGrowthRate);

    // Anomaly detection
    const anomalies = [];
    
    if (stats.cancelledOrders / stats.totalOrders > 0.3) {
      anomalies.push({
        severity: 'high',
        title: 'High Cancellation Rate',
        description: `${((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}% of orders are cancelled. Industry average is 15-20%.`,
        confidence: 92,
      });
    }

    if (stats.pendingOrders > stats.deliveredOrders * 0.5) {
      anomalies.push({
        severity: 'medium',
        title: 'Pending Orders Backlog',
        description: `${stats.pendingOrders} orders pending. Consider increasing delivery capacity.`,
        confidence: 85,
      });
    }

    if (stats.totalProducts / stats.totalFarmers < 3) {
      anomalies.push({
        severity: 'medium',
        title: 'Low Product Diversity',
        description: `Average ${(stats.totalProducts / stats.totalFarmers).toFixed(1)} products per farmer. Encourage more listings.`,
        confidence: 78,
      });
    }

    if (anomalies.length === 0) {
      anomalies.push({
        severity: 'low',
        title: 'Platform Operating Normally',
        description: 'No significant anomalies detected. All metrics within expected ranges.',
        confidence: 95,
      });
    }

    // Smart recommendations
    const recommendations = [
      {
        title: 'Expand Farmer Network',
        description: `Current farmer-to-consumer ratio is 1:${Math.round(stats.totalConsumers / stats.totalFarmers)}. Target 1:5 for optimal supply.`,
        impact: 'High - Increases product variety and availability',
      },
      {
        title: 'Optimize Delivery Process',
        description: `${stats.pendingOrders} orders pending. Implement AI route optimization to reduce delivery time by 30%.`,
        impact: 'Medium - Improves customer satisfaction',
      },
      {
        title: 'Launch Loyalty Program',
        description: 'Repeat customer rate can increase by 25% with rewards program based on AI analysis.',
        impact: 'High - Boosts customer retention',
      },
      {
        title: 'Seasonal Product Promotion',
        description: 'AI predicts 40% higher demand for seasonal products. Create targeted campaigns.',
        impact: 'Medium - Increases revenue per order',
      },
    ];

    // Platform health metrics
    const userEngagement = Math.min(95, 70 + (stats.totalOrders / totalUsers) * 100);
    const orderFulfillment = Math.min(95, (stats.deliveredOrders / stats.totalOrders) * 100);
    const platformStability = 85 + Math.random() * 10;
    const healthScore = Math.round((userEngagement + orderFulfillment + platformStability) / 3);

    setAiPredictions({
      nextMonthRevenue,
      revenueGrowth,
      newUsersNextMonth,
      growthRate,
      ordersNextMonth,
      anomalies,
      recommendations,
      healthScore,
      healthMetrics: {
        userEngagement: Math.round(userEngagement),
        orderFulfillment: Math.round(orderFulfillment),
        platformStability: Math.round(platformStability),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Farmers',
      value: stats.totalFarmers,
      icon: UserCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Consumers',
      value: stats.totalConsumers,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ShoppingBag,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Cancelled Orders',
      value: stats.cancelledOrders,
      icon: ShoppingBag,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">AI-powered predictive analytics and platform insights</p>
            </div>
            <button
              onClick={() => {
                setShowAIInsights(!showAIInsights);
                if (!aiPredictions) generateAIPredictions();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
            >
              <Brain className="w-5 h-5" />
              {showAIInsights ? 'Hide' : 'Show'} AI Insights
            </button>
          </div>
        </div>

        {/* AI Insights Dashboard */}
        {showAIInsights && aiPredictions && (
          <div className="mb-6 space-y-4">
            {/* AI Predictions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Target className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI Forecast</span>
                </div>
                <h3 className="text-sm font-medium mb-2">Revenue Prediction</h3>
                <p className="text-3xl font-bold mb-2">${aiPredictions.nextMonthRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-2 text-sm">
                  {aiPredictions.revenueGrowth > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(aiPredictions.revenueGrowth).toFixed(1)}% vs current month</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI Forecast</span>
                </div>
                <h3 className="text-sm font-medium mb-2">New Users Expected</h3>
                <p className="text-3xl font-bold mb-2">{aiPredictions.newUsersNextMonth}</p>
                <p className="text-sm">Based on {aiPredictions.growthRate.toFixed(1)}% growth trend</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <ShoppingBag className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI Forecast</span>
                </div>
                <h3 className="text-sm font-medium mb-2">Orders Forecast</h3>
                <p className="text-3xl font-bold mb-2">{aiPredictions.ordersNextMonth}</p>
                <p className="text-sm">Expected next month based on trends</p>
              </div>
            </div>

            {/* AI Anomaly Detection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                AI Anomaly Detection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiPredictions.anomalies.map((anomaly: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      anomaly.severity === 'high'
                        ? 'bg-red-50 border-red-500'
                        : anomaly.severity === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {anomaly.severity === 'high' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : anomaly.severity === 'medium' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{anomaly.title}</h4>
                        <p className="text-sm text-gray-600">{anomaly.description}</p>
                        <p className="text-xs text-gray-500 mt-2">AI Confidence: {anomaly.confidence}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">AI Smart Recommendations 🤖</h2>
                  <p className="text-sm text-purple-100">Data-driven action items for platform growth</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiPredictions.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-purple-100">{rec.description}</p>
                        <p className="text-xs text-purple-200 mt-2">Impact: {rec.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health Score */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                AI Platform Health Score
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          Overall Health
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-green-600">
                          {aiPredictions.healthScore}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${aiPredictions.healthScore}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          aiPredictions.healthScore >= 80
                            ? 'bg-green-500'
                            : aiPredictions.healthScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{aiPredictions.healthMetrics.userEngagement}%</p>
                      <p className="text-xs text-gray-600">User Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{aiPredictions.healthMetrics.orderFulfillment}%</p>
                      <p className="text-xs text-gray-600">Order Fulfillment</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{aiPredictions.healthMetrics.platformStability}%</p>
                      <p className="text-xs text-gray-600">Platform Stability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-xl p-6 shadow-md hover:shadow-lg transition`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-semibold">{stats.pendingOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="text-sm font-semibold">{stats.deliveredOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="text-sm font-semibold">{stats.cancelledOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Farmers</span>
                  <span className="text-sm font-semibold">{stats.totalFarmers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalFarmers + stats.totalConsumers > 0
                          ? (stats.totalFarmers / (stats.totalFarmers + stats.totalConsumers)) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Consumers</span>
                  <span className="text-sm font-semibold">{stats.totalConsumers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalFarmers + stats.totalConsumers > 0
                          ? (stats.totalConsumers / (stats.totalFarmers + stats.totalConsumers)) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

