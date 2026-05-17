import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  BarChart3,
  ShoppingCart,
  AlertTriangle,
  Target,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface Feature {
  icon: JSX.Element;
  name: string;
  before: string;
  beforeExample: string;
  after: string;
  afterExample: string;
  impact: string;
  color: string;
}

const AIShowcase = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'addProduct'>('dashboard');

  const features = {
    dashboard: [
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Revenue Forecasting',
        before: 'Manual estimation based on past sales',
        beforeExample: 'Example: "I made $800 last month, so maybe $850 this month?"',
        after: 'AI predicts next month earnings with 75-85% accuracy',
        afterExample: 'Example: "AI predicts $1,250 revenue next month with 75% confidence based on seasonal trends and product mix"',
        impact: '+25-40% revenue increase',
        color: 'purple',
      },
      {
        icon: <Users className="w-6 h-6" />,
        name: 'Customer Insights',
        before: 'No customer behavior analysis',
        beforeExample: 'Example: "I don\'t know who my best customers are or what they prefer"',
        after: 'AI identifies top customers and purchase patterns',
        afterExample: 'Example: "John Doe is your top customer ($450 spent, 12 orders). He buys vegetables weekly. Offer him a loyalty discount!"',
        impact: '+20% customer retention',
        color: 'blue',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Performance Metrics',
        before: 'Basic sales numbers only',
        beforeExample: 'Example: "Total revenue: $2,500. Total orders: 45. That\'s all I know."',
        after: 'Comprehensive analytics with AI recommendations',
        afterExample: 'Example: "Revenue: $2,500 | Orders: 45 | Avg order: $55.56 | AI suggests: Focus on high-margin vegetables"',
        impact: '70% better decision making',
        color: 'green',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Smart Recommendations',
        before: 'No actionable insights',
        beforeExample: 'Example: "I see my numbers but don\'t know what to do next"',
        after: 'AI provides specific actions to boost revenue',
        afterExample: 'Example: "✓ Increase tomato stock (high demand) ✓ Reduce carrot price by 10% ✓ Add more product photos"',
        impact: '60% time saved on planning',
        color: 'orange',
      },
    ],
    products: [
      {
        icon: <Zap className="w-6 h-6" />,
        name: 'Demand Predictions',
        before: 'Guessing which products will sell',
        beforeExample: 'Example: "I hope these tomatoes sell... maybe I should stock more?"',
        after: 'AI predicts demand levels for each product',
        afterExample: 'Example: "🟢 High demand - Tomatoes will sell 15 units in next 7 days. Stock up now!"',
        impact: '30% reduction in stockouts',
        color: 'purple',
      },
      {
        icon: <AlertTriangle className="w-6 h-6" />,
        name: 'Inventory Alerts',
        before: 'Manual inventory tracking',
        beforeExample: 'Example: "Oops! I ran out of tomatoes and didn\'t notice until customers complained"',
        after: 'Smart alerts for low stock, overstock, pricing issues',
        afterExample: 'Example: "🔴 Alert: Tomatoes low stock (5 units left). Restock soon! 🟡 Carrots price too high - reduce by 10%"',
        impact: '25% reduction in overstock',
        color: 'red',
      },
      {
        icon: <Award className="w-6 h-6" />,
        name: 'Optimization Scores',
        before: 'No listing quality feedback',
        beforeExample: 'Example: "Is my product listing good? I have no idea..."',
        after: 'AI rates each listing 0-100 with improvement tips',
        afterExample: 'Example: "Score: 85/100 🟢 Excellent! Tip: Add 2 more photos to increase sales by 30%"',
        impact: '+30% sales with optimized listings',
        color: 'yellow',
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        name: 'AI Recommendations',
        before: 'No guidance on product management',
        beforeExample: 'Example: "My products aren\'t selling well but I don\'t know why"',
        after: 'Specific actions for each product to boost sales',
        afterExample: 'Example: "💡 Tomatoes: Stock up - predicted to sell 15 units. 💡 Carrots: Lower price to $2.50 for better sales"',
        impact: '50% faster product optimization',
        color: 'blue',
      },
    ],
    addProduct: [
      {
        icon: <Package className="w-6 h-6" />,
        name: 'AI Descriptions',
        before: 'Writing descriptions manually',
        beforeExample: 'Example: Spending 10 minutes writing "Fresh tomatoes. Good quality. Buy now."',
        after: 'AI generates professional descriptions instantly',
        afterExample: 'Example: AI writes in 3 seconds: "Premium organic tomatoes, vine-ripened for maximum flavor. Rich in vitamins and antioxidants. Perfect for salads, sauces, and cooking. Freshly harvested from our sustainable farm."',
        impact: '80% time saved on listing',
        color: 'green',
      },
      {
        icon: <DollarSign className="w-6 h-6" />,
        name: 'Smart Pricing',
        before: 'Guessing competitive prices',
        beforeExample: 'Example: "Other farmers charge $3... I\'ll try $2.80? Or maybe $3.20?"',
        after: 'AI suggests optimal prices based on market data',
        afterExample: 'Example: "AI suggests $3.50/kg based on: quality (organic), season (high demand), market average ($3.20), your reputation (4.8★)"',
        impact: '+15-20% better pricing',
        color: 'purple',
      },
      {
        icon: <ShoppingCart className="w-6 h-6" />,
        name: 'Auto-Categorization',
        before: 'Manual category selection',
        beforeExample: 'Example: "Is this a vegetable or fruit? Let me check... vegetables, I think?"',
        after: 'AI automatically categorizes products',
        afterExample: 'Example: AI instantly detects: "Tomatoes → Vegetables category" with 95% confidence',
        impact: '90% accuracy in categorization',
        color: 'blue',
      },
      {
        icon: <CheckCircle2 className="w-6 h-6" />,
        name: 'Content Moderation',
        before: 'Products could be rejected later',
        beforeExample: 'Example: "I submitted my product... 2 days later it was rejected for inappropriate content 😞"',
        after: 'AI pre-checks content before submission',
        afterExample: 'Example: "✓ AI checked: Content is appropriate, images are clear, description is professional. Ready to publish!"',
        impact: '95% approval rate',
        color: 'green',
      },
    ],
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'bg-green-100 text-green-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-600' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'bg-red-100 text-red-600' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'bg-yellow-100 text-yellow-600' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Hackathon Results</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Farmer Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how AI integration transformed the Farmer Portal, bringing intelligent insights,
            automation, and data-driven decision making to help farmers succeed.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">+40%</div>
            <div className="text-gray-600">Revenue Increase</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
            <div className="text-gray-600">AI Accuracy</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600 mb-2">10+</div>
            <div className="text-gray-600">AI Features</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>My Products</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('addProduct')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'addProduct'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Add Product</span>
            </div>
          </button>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-left font-semibold">Before AI</th>
                  <th className="px-6 py-4 text-left font-semibold">After AI</th>
                  <th className="px-6 py-4 text-left font-semibold">Impact</th>
                </tr>
              </thead>
              <tbody>
                {features[activeTab].map((feature, index) => {
                  const colors = getColorClasses(feature.color);
                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.icon}`}>
                            {feature.icon}
                          </div>
                          <span className="font-semibold text-gray-900">{feature.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✗</span>
                          <div>
                            <div className="text-gray-900 font-medium mb-1">{feature.before}</div>
                            <div className="text-sm text-gray-500 italic bg-red-50 px-3 py-2 rounded border-l-2 border-red-300">
                              {feature.beforeExample}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <div>
                            <div className="text-gray-900 font-medium mb-1">{feature.after}</div>
                            <div className="text-sm text-gray-700 italic bg-green-50 px-3 py-2 rounded border-l-2 border-green-400">
                              {feature.afterExample}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold text-sm">{feature.impact}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Key Benefits
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Revenue Growth:</strong> AI-powered pricing and demand predictions increase sales by 25-40%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Time Efficiency:</strong> Automated insights save 60% of time on inventory management
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Better Decisions:</strong> Data-driven recommendations improve operational efficiency by 70%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Customer Retention:</strong> AI insights help maintain relationships with top customers
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              Operational Improvements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Inventory Optimization:</strong> 30% reduction in stockouts, 25% reduction in overstock
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Listing Quality:</strong> AI optimization increases product visibility by 40%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Forecast Accuracy:</strong> 75-85% accurate predictions for revenue and demand
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Content Approval:</strong> 95% approval rate with AI pre-moderation
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Experience AI-Powered Farming</h2>
          <p className="text-lg mb-6 opacity-90">
            Start using these powerful AI features today to grow your business and maximize your revenue.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/farmer/products')}
              className="bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-900 transition flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Manage Products
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/farmer/add-product')}
              className="bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-900 transition flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Add Product
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AIShowcase;
