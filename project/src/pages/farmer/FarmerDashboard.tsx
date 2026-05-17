import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  Loader2,
  Users,
  BarChart3,
} from 'lucide-react';
import { forecastRevenue, analyzeCustomerBehavior } from '../../lib/gemini';

interface DashboardStats {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface AIInsights {
  revenueForecast?: {
    predictedRevenue: number;
    confidence: number;
    insights: string[];
    recommendations: string[];
  };
  customerAnalysis?: {
    topCustomers: Array<{ name: string; totalSpent: number; orderCount: number }>;
    recommendations: string[];
  };
}

const FarmerDashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [aiInsights, setAiInsights] = useState<AIInsights>({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [userData]);

  useEffect(() => {
    if (showAI && !aiInsights.revenueForecast) {
      generateAIInsights();
    }
  }, [showAI]);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsQuery = query(
        collection(db, 'products'),
        where('farmerId', '==', userData?.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('farmerId', '==', userData?.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );

      setStats({
        totalProducts: products.length,
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setAiLoading(true);
    try {
      // Fetch products for revenue forecast
      const productsQuery = query(
        collection(db, 'products'),
        where('farmerId', '==', userData?.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map((doc) => ({
        name: doc.data().name,
        pricePerUnit: doc.data().pricePerUnit,
        quantity: doc.data().quantity,
        category: doc.data().category,
      }));

      // Fetch orders for customer analysis
      const ordersQuery = query(
        collection(db, 'orders'),
        where('farmerId', '==', userData?.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          customerId: data.userId || 'unknown',
          customerName: data.userName || 'Unknown Customer',
          products: data.items?.map((item: any) => item.productName) || [],
          totalAmount: data.totalAmount || 0,
          date: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown',
        };
      });

      // Generate revenue forecast
      const forecast = await forecastRevenue(
        userData?.uid || '',
        products,
        undefined,
        'month'
      );

      // Analyze customer behavior
      let customerAnalysis;
      if (orders.length > 0) {
        customerAnalysis = await analyzeCustomerBehavior(userData?.uid || '', orders);
      }

      setAiInsights({
        revenueForecast: forecast,
        customerAnalysis,
      });

      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate AI insights');
      console.error(error);
    } finally {
      setAiLoading(false);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {userData?.name}!</p>
          </div>
          <button
            onClick={() => setShowAI(!showAI)}
            disabled={aiLoading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md disabled:bg-gray-400"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {showAI ? 'Hide AI Insights' : 'Show AI Insights'}
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        {showAI && aiInsights.revenueForecast && (
          <div className="space-y-6">
            {/* Revenue Forecast */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revenue Forecast</h2>
                  <p className="text-sm text-gray-600">AI-powered predictions for next month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-2">Predicted Revenue</p>
                  <p className="text-4xl font-bold text-green-600">
                    ${aiInsights.revenueForecast.predictedRevenue.toFixed(2)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${aiInsights.revenueForecast.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {aiInsights.revenueForecast.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-3 font-semibold">Key Insights</p>
                  <ul className="space-y-2">
                    {aiInsights.revenueForecast.insights.slice(0, 3).map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {aiInsights.revenueForecast.recommendations.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <p className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Recommendations
                  </p>
                  <div className="space-y-2">
                    {aiInsights.revenueForecast.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Analysis */}
            {aiInsights.customerAnalysis && aiInsights.customerAnalysis.topCustomers.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-md p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Customer Insights</h2>
                    <p className="text-sm text-gray-600">Your top customers and patterns</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-900 font-semibold mb-3">Top Customers</p>
                  <div className="space-y-3">
                    {aiInsights.customerAnalysis.topCustomers.slice(0, 5).map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${customer.totalSpent.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {aiInsights.customerAnalysis.recommendations.length > 0 && (
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <p className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Customer Retention Tips
                    </p>
                    <div className="space-y-2">
                      {aiInsights.customerAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 font-bold">→</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/farmer/add-product'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <Package className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">Add New Product</p>
              <p className="text-sm text-gray-600 mt-1">List a new product for sale</p>
            </button>

            <button
              onClick={() => window.location.href = '/farmer/products'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-600 mt-1">View and edit your listings</p>
            </button>

            <button
              onClick={() => window.location.href = '/farmer/orders'}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600 mt-1">Check your order history</p>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
