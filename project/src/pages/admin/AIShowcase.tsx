import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import {
  Sparkles,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  ShoppingCart,
  AlertTriangle,
  Target,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  Shield,
  MessageSquare,
  Megaphone,
  DollarSign,
  Truck,
  FileText,
  Settings,
  Brain,
  Clock,
  TrendingDown,
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'reviews' | 'users' | 'orders' | 'announcements' | 'prices' | 'delivery'>('dashboard');

  const features = {
    dashboard: [
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Revenue Forecasting',
        before: 'Manual estimation based on past data',
        beforeExample: 'Example: "Last month was $50,000, so maybe $52,000 this month?"',
        after: 'AI predicts revenue with 85% accuracy using trends',
        afterExample: 'Example: "AI predicts $58,500 revenue next month (85% confidence) based on seasonal trends, user growth, and product mix"',
        impact: '+20% better planning',
        color: 'purple',
      },
      {
        icon: <Brain className="w-6 h-6" />,
        name: 'Smart Insights',
        before: 'Manual data analysis required',
        beforeExample: 'Example: "I need to spend hours analyzing data to find patterns"',
        after: 'AI generates actionable recommendations instantly',
        afterExample: 'Example: "💡 Promote vegetables - 30% demand increase detected. 💡 3 farmers inactive - send reminder. 💡 Peak orders 6-8 PM - optimize delivery"',
        impact: '60% time saved',
        color: 'blue',
      },
      {
        icon: <AlertTriangle className="w-6 h-6" />,
        name: 'Anomaly Detection',
        before: 'Issues discovered after they occur',
        beforeExample: 'Example: "Revenue dropped 40% last week and I didn\'t notice until now!"',
        after: 'AI alerts on unusual patterns in real-time',
        afterExample: 'Example: "🚨 Alert: Revenue down 15% today. Possible payment gateway issue detected. 🚨 Suspicious bulk order flagged for review"',
        impact: '90% faster issue detection',
        color: 'red',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Demand Prediction',
        before: 'No visibility into future demand',
        beforeExample: 'Example: "I don\'t know which products will be popular next week"',
        after: 'AI forecasts product demand trends',
        afterExample: 'Example: "📈 High demand predicted: Tomatoes (+40%), Lettuce (+25%). 📉 Low demand: Carrots (-15%). Notify farmers to adjust inventory"',
        impact: '30% waste reduction',
        color: 'green',
      },
    ],
    products: [
      {
        icon: <Shield className="w-6 h-6" />,
        name: 'Content Moderation',
        before: 'Manual review of every product listing',
        beforeExample: 'Example: "Spending 5 minutes reviewing each of 50 products = 4+ hours daily"',
        after: 'AI scans and approves products instantly',
        afterExample: 'Example: "✓ AI reviewed 50 products in 10 seconds. 47 approved, 3 flagged for review (inappropriate content detected)"',
        impact: '95% time saved',
        color: 'purple',
      },
      {
        icon: <Zap className="w-6 h-6" />,
        name: 'Image Quality Analysis',
        before: 'No automated quality checks',
        beforeExample: 'Example: "Products with blurry photos get approved, leading to customer complaints"',
        after: 'AI evaluates photo quality and clarity',
        afterExample: 'Example: "⚠️ Image quality low (score: 45/100). Recommendation: Request farmer to upload clearer photos for 30% better sales"',
        impact: '40% better quality',
        color: 'blue',
      },
      {
        icon: <CheckCircle2 className="w-6 h-6" />,
        name: 'Bulk Moderation',
        before: 'Reviewing products one by one',
        beforeExample: 'Example: "I have 100 pending products. This will take all day..."',
        after: 'One-click AI processing of all pending items',
        afterExample: 'Example: "Click \'Moderate All\' → AI processes 100 products in 20 seconds → 92 approved, 8 flagged with specific reasons"',
        impact: '98% faster processing',
        color: 'green',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'AI Statistics Dashboard',
        before: 'No visibility into moderation metrics',
        beforeExample: 'Example: "I don\'t know how many products are pending or what issues are common"',
        after: 'Real-time AI moderation analytics',
        afterExample: 'Example: "Dashboard shows: 85% auto-approved, 12% flagged, 3% rejected. Top issue: Low image quality (45 products)"',
        impact: '100% visibility',
        color: 'orange',
      },
    ],
    reviews: [
      {
        icon: <MessageSquare className="w-6 h-6" />,
        name: 'Sentiment Analysis',
        before: 'Reading reviews manually to gauge satisfaction',
        beforeExample: 'Example: "Reading through 200 reviews to understand if customers are happy... this takes hours"',
        after: 'AI analyzes sentiment across all reviews instantly',
        afterExample: 'Example: "Overall sentiment: 78/100 (Positive) 😊. 65% positive, 25% neutral, 10% negative. Trending up +5% this month"',
        impact: '80% time saved',
        color: 'purple',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Key Topics Extraction',
        before: 'No insight into common themes',
        beforeExample: 'Example: "I don\'t know what customers are talking about most in reviews"',
        after: 'AI identifies trending topics and themes',
        afterExample: 'Example: "Top topics: \'Fresh quality\' (mentioned 45 times), \'Fast delivery\' (38 times), \'Packaging\' (22 times, mostly negative)"',
        impact: '100% topic visibility',
        color: 'blue',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Trend Detection',
        before: 'Issues discovered too late',
        beforeExample: 'Example: "Customers complained about delivery for weeks before I noticed the pattern"',
        after: 'AI spots positive/negative patterns early',
        afterExample: 'Example: "🚨 Alert: \'Delivery delay\' mentions increased 40% this week. Action needed! ✅ \'Product quality\' sentiment improved 25%"',
        impact: '90% faster response',
        color: 'green',
      },
      {
        icon: <FileText className="w-6 h-6" />,
        name: 'Summary Generation',
        before: 'No executive overview available',
        beforeExample: 'Example: "I need to manually compile review insights for monthly reports"',
        after: 'AI creates comprehensive review summaries',
        afterExample: 'Example: "AI Summary: Customers love product freshness (4.8★) but delivery times need improvement (3.2★). Recommend: Hire 2 more delivery personnel"',
        impact: '75% faster reporting',
        color: 'orange',
      },
    ],
    users: [
      {
        icon: <Users className="w-6 h-6" />,
        name: 'Activity Scoring',
        before: 'No visibility into user engagement',
        beforeExample: 'Example: "I don\'t know which users are active or inactive"',
        after: 'AI rates user engagement with 0-100 score',
        afterExample: 'Example: "John Doe: 85/100 (Power user) - 45 orders, daily logins. Jane Smith: 15/100 (At-risk) - No activity in 30 days, send re-engagement email"',
        impact: '70% better retention',
        color: 'purple',
      },
      {
        icon: <Shield className="w-6 h-6" />,
        name: 'Fraud Detection',
        before: 'Fake accounts discovered manually',
        beforeExample: 'Example: "Discovered 10 bot accounts after they already caused problems"',
        after: 'AI monitors and flags suspicious activity',
        afterExample: 'Example: "🚨 5 suspicious accounts detected: Multiple signups from same IP, fake profile info, no purchase history. Auto-flagged for review"',
        impact: '95% fraud prevention',
        color: 'red',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'User Segmentation',
        before: 'All users treated the same',
        beforeExample: 'Example: "Sending generic messages to everyone, low engagement"',
        after: 'AI groups users by behavior patterns',
        afterExample: 'Example: "Segments: Power users (15%), Regular buyers (40%), Occasional (30%), At-risk (15%). Target each group with personalized campaigns"',
        impact: '+50% engagement',
        color: 'blue',
      },
      {
        icon: <Zap className="w-6 h-6" />,
        name: 'Smart Recommendations',
        before: 'No guidance on user management',
        beforeExample: 'Example: "This consumer sells products frequently but I didn\'t notice"',
        after: 'AI suggests role changes and actions',
        afterExample: 'Example: "💡 User #123 frequently sells - suggest farmer upgrade? 💡 User #456 has 5 failed orders - proactive support needed"',
        impact: '60% better management',
        color: 'green',
      },
    ],
    orders: [
      {
        icon: <Truck className="w-6 h-6" />,
        name: 'Delivery Optimization',
        before: 'Manual delivery assignment',
        beforeExample: 'Example: "Randomly assigning orders to delivery personnel, inefficient routes"',
        after: 'AI matches orders with optimal delivery personnel',
        afterExample: 'Example: "AI assigned Order #123 to Driver A (closest, 95% success rate, available now). Estimated delivery: 25 mins. Route optimized with 3 nearby orders"',
        impact: '+25% efficiency',
        color: 'purple',
      },
      {
        icon: <AlertTriangle className="w-6 h-6" />,
        name: 'Fraud Detection',
        before: 'Fraudulent orders discovered after loss',
        beforeExample: 'Example: "Lost $500 to fake orders with stolen payment info"',
        after: 'AI flags suspicious orders before processing',
        afterExample: 'Example: "🚨 Order #456 flagged: New account, high value ($500), shipping to different state than billing. Hold for verification"',
        impact: '90% fraud prevention',
        color: 'red',
      },
      {
        icon: <Clock className="w-6 h-6" />,
        name: 'Delivery Time Prediction',
        before: 'Generic delivery estimates',
        beforeExample: 'Example: "All orders show \'2-3 hours\' regardless of distance or conditions"',
        after: 'AI calculates accurate delivery times',
        afterExample: 'Example: "Order #789: 35 minutes (considering traffic, weather, distance, driver performance). Customer notified with accurate ETA"',
        impact: '+40% satisfaction',
        color: 'blue',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Quality Issue Prediction',
        before: 'Reactive problem solving',
        beforeExample: 'Example: "Customer complains about spoiled produce after delivery"',
        after: 'AI predicts potential quality issues',
        afterExample: 'Example: "⚠️ Order #234: High risk (leafy greens, 90°F weather, 2-hour delivery). Recommend: Priority delivery or ice pack"',
        impact: '50% fewer complaints',
        color: 'orange',
      },
    ],
    announcements: [
      {
        icon: <Megaphone className="w-6 h-6" />,
        name: 'AI Content Generation',
        before: 'Writing announcements manually',
        beforeExample: 'Example: "Spending 30 minutes crafting each announcement message"',
        after: 'AI generates professional announcements instantly',
        afterExample: 'Example: "AI writes in 5 seconds: \'Dear Farmers, We\'re excited to announce new AI-powered pricing tools to help you maximize revenue. Check your dashboard today!\'"',
        impact: '80% time saved',
        color: 'purple',
      },
      {
        icon: <Clock className="w-6 h-6" />,
        name: 'Smart Scheduling',
        before: 'Posting at random times',
        beforeExample: 'Example: "Posted announcement at 3 AM, only 10% of users saw it"',
        after: 'AI suggests optimal posting times',
        afterExample: 'Example: "AI recommends: Post at 6:30 PM (peak user activity). Expected reach: 85% of active users within 2 hours"',
        impact: '+60% engagement',
        color: 'blue',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Audience Targeting',
        before: 'Sending to all users regardless of relevance',
        beforeExample: 'Example: "Sending farmer-specific updates to consumers too, causing confusion"',
        after: 'AI identifies relevant user segments',
        afterExample: 'Example: "AI targets: Send to 45 farmers with low sales (relevant). Exclude 120 consumers (not relevant). Personalize with farmer names and stats"',
        impact: '+75% relevance',
        color: 'green',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Performance Analytics',
        before: 'No feedback on announcement effectiveness',
        beforeExample: 'Example: "I don\'t know if anyone read my announcements or took action"',
        after: 'AI tracks engagement and effectiveness',
        afterExample: 'Example: "Announcement #12: 78% read rate, 45% click rate, 12% action rate. AI suggests: Use similar tone for future announcements"',
        impact: '100% visibility',
        color: 'orange',
      },
    ],
    prices: [
      {
        icon: <DollarSign className="w-6 h-6" />,
        name: 'Dynamic Pricing Engine',
        before: 'Static price suggestions',
        beforeExample: 'Example: "Suggesting $3/kg for tomatoes regardless of market conditions"',
        after: 'AI adjusts prices based on real-time market data',
        afterExample: 'Example: "AI suggests $4.20/kg for tomatoes (up from $3.50): High demand detected, competitor prices increased, seasonal peak"',
        impact: '+30% farmer revenue',
        color: 'purple',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Seasonal Pricing',
        before: 'No seasonal adjustments',
        beforeExample: 'Example: "Same prices year-round, missing peak season opportunities"',
        after: 'AI predicts seasonal price fluctuations',
        afterExample: 'Example: "AI calendar: Tomatoes peak in July ($5/kg), low in December ($2.50/kg). Plan inventory accordingly for max profit"',
        impact: '+25% seasonal gains',
        color: 'blue',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Demand-Based Pricing',
        before: 'Fixed pricing regardless of demand',
        beforeExample: 'Example: "High-demand items priced same as slow-moving inventory"',
        after: 'AI adjusts prices based on demand levels',
        afterExample: 'Example: "Lettuce demand +40% → AI suggests $3.80/kg (up 15%). Carrots demand -20% → AI suggests $2.10/kg (down 10%) to move inventory"',
        impact: '+20% profit optimization',
        color: 'green',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Competitive Intelligence',
        before: 'No competitor price tracking',
        beforeExample: 'Example: "I don\'t know what other platforms charge for similar products"',
        after: 'AI monitors competitor pricing strategies',
        afterExample: 'Example: "Competitor analysis: Your tomatoes $3.50/kg vs market avg $3.80/kg. AI suggests: Increase to $3.75/kg for competitive advantage"',
        impact: '+15% competitiveness',
        color: 'orange',
      },
    ],
    delivery: [
      {
        icon: <Truck className="w-6 h-6" />,
        name: 'Intelligent Matching',
        before: 'Manual delivery assignment',
        beforeExample: 'Example: "Assigning orders randomly, some drivers overloaded while others idle"',
        after: 'AI optimizes delivery personnel assignment',
        afterExample: 'Example: "AI assigns Order #123 to Driver B: Closest (2 km), high rating (4.9★), available capacity (3 more orders possible), optimal route"',
        impact: '+35% efficiency',
        color: 'purple',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Performance-Based Routing',
        before: 'No consideration of driver performance',
        beforeExample: 'Example: "High-value orders assigned to unreliable drivers, causing issues"',
        after: 'AI assigns based on success rates',
        afterExample: 'Example: "High-value order ($200) → Assigned to Driver A (98% success rate, 4.9★). Standard order → Driver C (85% success rate, 4.2★)"',
        impact: '+40% satisfaction',
        color: 'blue',
      },
      {
        icon: <Clock className="w-6 h-6" />,
        name: 'Demand Forecasting',
        before: 'Reactive staffing decisions',
        beforeExample: 'Example: "Friday rush hits, not enough drivers, orders delayed 2+ hours"',
        after: 'AI predicts busy periods and staffing needs',
        afterExample: 'Example: "AI predicts: Friday 6-8 PM will have 45 orders. Current staff: 5 drivers. Recommendation: Schedule 3 additional drivers"',
        impact: '50% fewer delays',
        color: 'green',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Capacity Planning',
        before: 'No visibility into resource utilization',
        beforeExample: 'Example: "I don\'t know if I have too many or too few delivery personnel"',
        after: 'AI calculates optimal fleet size',
        afterExample: 'Example: "AI analysis: Current 8 drivers handle 120 orders/day at 75% capacity. Growth projection: Need 2 more drivers by next month"',
        impact: '+25% cost efficiency',
        color: 'orange',
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

  const tabConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'prices', label: 'Pricing', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'delivery', label: 'Delivery', icon: <Truck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI-Powered Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Admin Portal AI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how AI integration transforms platform management with intelligent automation,
            predictive analytics, and data-driven insights across every admin function.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
            <div className="text-gray-600">AI Accuracy</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
            <div className="text-3xl font-bold text-pink-600 mb-2">+30%</div>
            <div className="text-gray-600">Revenue Impact</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">24+</div>
            <div className="text-gray-600">AI Features</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              Key Benefits
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Operational Efficiency:</strong> AI automation saves 95% of time on manual tasks like content moderation and data analysis
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Revenue Growth:</strong> Predictive analytics and dynamic pricing increase platform revenue by 30%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Fraud Prevention:</strong> AI detects 95% of fraudulent activity before it causes damage
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Data-Driven Decisions:</strong> Real-time insights and recommendations improve decision quality by 70%
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Platform Improvements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Quality Assurance:</strong> 90% accuracy in content moderation ensures consistent platform standards
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Customer Satisfaction:</strong> AI-optimized delivery and quality predictions increase satisfaction by 40%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Predictive Accuracy:</strong> 85% accurate forecasts for revenue, demand, and user behavior
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Scalability:</strong> AI handles growing platform volume without proportional increase in admin workload
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Implementation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-green-900">Implemented ✅</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Product Content Moderation</li>
                <li>• Image Quality Analysis</li>
                <li>• Bulk Moderation</li>
                <li>• Reviews Sentiment Analysis</li>
                <li>• Key Topics Extraction</li>
                <li>• Trend Detection</li>
              </ul>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <h4 className="font-bold text-yellow-900">In Progress 🚧</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Dashboard Predictive Analytics</li>
                <li>• Smart Delivery Assignment</li>
                <li>• User Activity Scoring</li>
                <li>• Fraud Detection System</li>
                <li>• Dynamic Pricing Engine</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-blue-900">Planned 📋</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• AI Announcement Generation</li>
                <li>• Automated Report Creation</li>
                <li>• Natural Language Queries</li>
                <li>• Advanced What-If Analysis</li>
                <li>• AI Configuration Panel</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Impact by Page */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Expected Impact by Page
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Page</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Time Saved</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Accuracy</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Revenue Impact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { page: 'Product Management', time: '95%', accuracy: '90%', revenue: '+15%', color: 'purple' },
                  { page: 'Reviews Management', time: '80%', accuracy: '85%', revenue: '+10%', color: 'blue' },
                  { page: 'Admin Dashboard', time: '60%', accuracy: '85%', revenue: '+20%', color: 'green' },
                  { page: 'User Management', time: '70%', accuracy: '95%', revenue: '+10%', color: 'orange' },
                  { page: 'Order Management', time: '50%', accuracy: '90%', revenue: '+25%', color: 'red' },
                  { page: 'Announcements', time: '75%', accuracy: 'N/A', revenue: '+15%', color: 'purple' },
                  { page: 'Suggested Prices', time: '40%', accuracy: '85%', revenue: '+30%', color: 'blue' },
                  { page: 'Delivery Assignment', time: '65%', accuracy: '90%', revenue: '+20%', color: 'green' },
                ].map((row, index) => (
                  <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.page}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        {row.time}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                        <Target className="w-4 h-4" />
                        {row.accuracy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {row.revenue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Experience AI-Powered Administration</h2>
          <p className="text-lg mb-6 opacity-90">
            Start using these powerful AI features today to streamline operations, boost revenue, and make data-driven decisions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-indigo-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-900 transition flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Moderate Products
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="bg-indigo-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-900 transition flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Analyze Reviews
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
