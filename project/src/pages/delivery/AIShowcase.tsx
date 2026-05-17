import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Sparkles,
  TrendingUp,
  Package,
  Truck,
  BarChart3,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  Route,
  Shield,
  Bell,
  User,
  DollarSign,
  Navigation,
  FileText,
  MapPin,
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assigned' | 'history' | 'notifications' | 'profile' | 'earnings'>('dashboard');

  const features = {
    dashboard: [
      {
        icon: <Route className="w-6 h-6" />,
        name: 'Smart Route Optimization',
        before: 'Manual route planning using basic maps',
        beforeExample: 'Example: "I\'ll just follow GPS and hope for the best. Takes 45 minutes with traffic"',
        after: 'AI calculates optimal routes with real-time traffic',
        afterExample: 'Example: "AI suggests Highway 101 route: 25 mins, avoids construction on Main St. Alternative route: 28 mins via Oak Ave"',
        impact: '+35% faster deliveries',
        color: 'purple',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Performance Analytics',
        before: 'No insights into delivery performance',
        beforeExample: 'Example: "I completed 12 deliveries today. Don\'t know if that\'s good or bad"',
        after: 'AI analyzes performance with actionable insights',
        afterExample: 'Example: "12 deliveries (above avg of 10). Avg time: 22 mins (excellent). AI tip: Peak efficiency at 2-4 PM - schedule more deliveries then"',
        impact: '+25% efficiency gain',
        color: 'blue',
      },
      {
        icon: <AlertTriangle className="w-6 h-6" />,
        name: 'Predictive Issue Detection',
        before: 'Problems discovered during delivery',
        beforeExample: 'Example: "Arrived at customer location - they\'re not home. Now what?"',
        after: 'AI predicts and prevents delivery issues',
        afterExample: 'Example: "⚠️ Customer #123 historically unavailable 2-4 PM. AI suggests: Call ahead or reschedule to evening slot"',
        impact: '60% fewer failed deliveries',
        color: 'red',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'AI Delivery Assistant',
        before: 'No real-time guidance during deliveries',
        beforeExample: 'Example: "Customer complaining about damaged goods. I don\'t know company policy"',
        after: 'Instant AI support for any delivery situation',
        afterExample: 'Example: "AI Assistant: For damaged goods: 1) Take photos 2) Offer 50% refund 3) Log incident #DG2024-456 4) Contact support if >$50"',
        impact: '80% faster problem resolution',
        color: 'green',
      },
    ],
    assigned: [
      {
        icon: <Thermometer className="w-6 h-6" />,
        name: 'Cold-Chain Compliance',
        before: 'Manual temperature checks and guesswork',
        beforeExample: 'Example: "Chicken is at 5°C. Is that okay? I think so... maybe?"',
        after: 'AI validates temperature compliance instantly',
        afterExample: 'Example: "❌ Non-Compliant: Chicken at 5°C exceeds max 4°C. Action: REJECT. Request farmer to cool to 4°C before pickup"',
        impact: '95% compliance accuracy',
        color: 'purple',
      },
      {
        icon: <Package className="w-6 h-6" />,
        name: 'Smart Handling Instructions',
        before: 'Generic handling for all products',
        beforeExample: 'Example: "30kg of leafy greens. Just load them in the truck, I guess"',
        after: 'AI provides product-specific handling guidance',
        afterExample: 'Example: "Leafy Greens Protocol: 1) Inspect for damage 2) Keep 1-4°C 3) Use clean containers 4) Stack carefully 5) Avoid sunlight. Est. time: 10 mins"',
        impact: '40% reduction in damage',
        color: 'blue',
      },
      {
        icon: <Navigation className="w-6 h-6" />,
        name: 'Dynamic Route Updates',
        before: 'Static routes regardless of conditions',
        beforeExample: 'Example: "Following original route even though there\'s a traffic jam ahead"',
        after: 'AI adjusts routes in real-time based on conditions',
        afterExample: 'Example: "🚨 Traffic detected on Highway 101. AI rerouting via Oak Ave: +5 mins but avoids 20-min delay. Accept new route?"',
        impact: '30% time savings',
        color: 'green',
      },
      {
        icon: <Shield className="w-6 h-6" />,
        name: 'Instant SOP Access',
        before: 'Searching through manuals for procedures',
        beforeExample: 'Example: "Customer wants to change delivery address. Let me find the policy manual..."',
        after: 'AI provides instant access to company procedures',
        afterExample: 'Example: "Address Change SOP: 1) Verify customer identity 2) Check delivery zone 3) Update system 4) Confirm new ETA. Max 1 change per order"',
        impact: '90% faster policy lookup',
        color: 'orange',
      },
    ],
    history: [
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Performance Trends Analysis',
        before: 'No historical performance insights',
        beforeExample: 'Example: "I think I\'m doing okay, but I don\'t have any data to prove it"',
        after: 'AI analyzes trends and suggests improvements',
        afterExample: 'Example: "Last 30 days: Avg delivery time improved 15%. Best performance: Tuesdays (18 min avg). AI suggests: Request more Tuesday shifts"',
        impact: '+20% performance optimization',
        color: 'purple',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Success Pattern Recognition',
        before: 'No understanding of what works best',
        beforeExample: 'Example: "Some days are good, some are bad. No idea why"',
        after: 'AI identifies patterns in successful deliveries',
        afterExample: 'Example: "Success Pattern: Morning deliveries (95% success) vs afternoon (78%). Route efficiency peaks with 8-12 deliveries per batch"',
        impact: '+30% success rate',
        color: 'blue',
      },
      {
        icon: <AlertTriangle className="w-6 h-6" />,
        name: 'Issue Pattern Analysis',
        before: 'Repeating same mistakes without learning',
        beforeExample: 'Example: "Keep having problems with deliveries on Elm Street but don\'t know why"',
        after: 'AI identifies recurring issues and solutions',
        afterExample: 'Example: "Elm Street issues: 60% customer unavailable 12-2 PM. AI recommendation: Schedule Elm St deliveries for evening slots only"',
        impact: '50% fewer repeat issues',
        color: 'red',
      },
      {
        icon: <Award className="w-6 h-6" />,
        name: 'Achievement Tracking',
        before: 'No recognition of improvements',
        beforeExample: 'Example: "I feel like I\'m getting better but have no way to measure it"',
        after: 'AI tracks achievements and milestones',
        afterExample: 'Example: "🏆 New Record: 15 deliveries in one day! 🏆 Streak: 7 days with 100% on-time delivery. Next goal: 20 deliveries/day"',
        impact: '+40% motivation boost',
        color: 'green',
      },
    ],
    notifications: [
      {
        icon: <Bell className="w-6 h-6" />,
        name: 'Smart Priority Alerts',
        before: 'All notifications treated equally',
        beforeExample: 'Example: "Getting 20 notifications. Don\'t know which ones are urgent"',
        after: 'AI prioritizes notifications by importance',
        afterExample: 'Example: "🔴 URGENT: Cold-chain breach on Order #456 (5 mins to fix) 🟡 Medium: Customer called about Order #789 🟢 Low: Weekly report ready"',
        impact: '70% better response time',
        color: 'purple',
      },
      {
        icon: <Clock className="w-6 h-6" />,
        name: 'Predictive Notifications',
        before: 'Reactive notifications after issues occur',
        beforeExample: 'Example: "Customer complaining they haven\'t received their order yet"',
        after: 'AI sends proactive alerts before problems',
        afterExample: 'Example: "⚠️ Proactive Alert: Order #123 will be 15 mins late due to traffic. Customer auto-notified. Consider calling to apologize"',
        impact: '60% fewer complaints',
        color: 'blue',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Context-Aware Alerts',
        before: 'Generic notifications without context',
        beforeExample: 'Example: "New order assigned" - no details about urgency or special requirements',
        after: 'AI provides rich context with each notification',
        afterExample: 'Example: "🚨 New URGENT Order: Organic chicken (cold-chain critical), 2.5km away, customer premium tier, deliver by 3 PM (45 mins left)"',
        impact: '+50% faster decision making',
        color: 'green',
      },
      {
        icon: <Zap className="w-6 h-6" />,
        name: 'Smart Notification Timing',
        before: 'Notifications sent at random times',
        beforeExample: 'Example: "Getting notifications while driving - dangerous and distracting"',
        after: 'AI sends notifications at optimal times',
        afterExample: 'Example: "AI detected you\'re driving. Holding 3 non-urgent notifications. Will deliver when you stop in 8 minutes"',
        impact: '80% safer driving',
        color: 'orange',
      },
    ],
    profile: [
      {
        icon: <User className="w-6 h-6" />,
        name: 'Performance Insights',
        before: 'No feedback on personal performance',
        beforeExample: 'Example: "I don\'t know how I compare to other delivery personnel"',
        after: 'AI provides personalized performance analytics',
        afterExample: 'Example: "Your Performance: Top 15% of drivers. Strengths: Speed (92nd percentile), Customer rating (4.9★). Improvement area: Cold-chain compliance"',
        impact: '+25% skill development',
        color: 'purple',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Skill Development Recommendations',
        before: 'No guidance on career improvement',
        beforeExample: 'Example: "Want to get better at my job but don\'t know what to focus on"',
        after: 'AI suggests personalized training and goals',
        afterExample: 'Example: "AI Recommendations: 1) Complete cold-chain certification (boost earnings 15%) 2) Improve route efficiency 3) Focus on customer service skills"',
        impact: '+30% career growth',
        color: 'blue',
      },
      {
        icon: <Award className="w-6 h-6" />,
        name: 'Achievement System',
        before: 'No recognition for good performance',
        beforeExample: 'Example: "Working hard but no one notices or rewards improvement"',
        after: 'AI tracks and celebrates achievements',
        afterExample: 'Example: "🏆 Achievements Unlocked: Speed Demon (avg <20 min), Customer Favorite (4.8★+), Cold Chain Expert (100% compliance). Bonus: +$50"',
        impact: '+40% job satisfaction',
        color: 'green',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Smart Goal Setting',
        before: 'No structured improvement goals',
        beforeExample: 'Example: "Want to improve but don\'t know what realistic goals to set"',
        after: 'AI sets personalized, achievable goals',
        afterExample: 'Example: "This Week\'s Goals: 1) Complete 60 deliveries (current: 45) 2) Maintain 4.8★ rating 3) Zero cold-chain violations. Reward: $25 bonus"',
        impact: '+35% goal achievement',
        color: 'orange',
      },
    ],
    earnings: [
      {
        icon: <DollarSign className="w-6 h-6" />,
        name: 'Earnings Optimization',
        before: 'No insight into maximizing income',
        beforeExample: 'Example: "Making $150/day but don\'t know how to earn more"',
        after: 'AI suggests strategies to boost earnings',
        afterExample: 'Example: "Earnings Boost Tips: 1) Work 6-8 PM peak hours (+$30/day) 2) Accept cold-chain orders (+15% bonus) 3) Maintain 4.8★ rating (premium orders)"',
        impact: '+25% income increase',
        color: 'purple',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        name: 'Revenue Forecasting',
        before: 'No prediction of future earnings',
        beforeExample: 'Example: "Don\'t know how much I\'ll make this month or if I can pay bills"',
        after: 'AI predicts earnings based on performance trends',
        afterExample: 'Example: "Monthly Forecast: $3,200 (based on current pace). Peak earning days: Fri-Sun. Slow period: Mid-month. Plan accordingly"',
        impact: '+20% financial planning',
        color: 'blue',
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: 'Bonus Opportunity Alerts',
        before: 'Missing out on bonus opportunities',
        beforeExample: 'Example: "Didn\'t know there was a bonus for weekend deliveries until it was too late"',
        after: 'AI alerts about earning opportunities',
        afterExample: 'Example: "💰 Bonus Alert: Weekend surge +50% active now! Cold-chain deliveries +$5 each. Accept 3 more orders to unlock $25 streak bonus"',
        impact: '+30% bonus earnings',
        color: 'green',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        name: 'Performance-Based Insights',
        before: 'No connection between performance and pay',
        beforeExample: 'Example: "Don\'t understand why some weeks I earn more than others"',
        after: 'AI shows how performance impacts earnings',
        afterExample: 'Example: "Performance Impact: 4.9★ rating = +15% premium orders. <20 min avg delivery = +$2/order speed bonus. 100% compliance = +$50/week"',
        impact: '+35% earnings awareness',
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
    { id: 'assigned', label: 'Deliveries', icon: <Truck className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI-Powered Logistics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Delivery Portal AI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how AI integration transforms delivery operations with intelligent route optimization,
            real-time compliance monitoring, and predictive logistics management.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">+35%</div>
            <div className="text-gray-600">Faster Deliveries</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cyan-500">
            <div className="text-3xl font-bold text-cyan-600 mb-2">95%</div>
            <div className="text-gray-600">Compliance Rate</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-500">
            <div className="text-3xl font-bold text-teal-600 mb-2">60%</div>
            <div className="text-gray-600">Fewer Failed Deliveries</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">+25%</div>
            <div className="text-gray-600">Income Increase</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
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
                <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
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
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Key Benefits
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Delivery Efficiency:</strong> AI route optimization and predictive analytics increase delivery speed by 35%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Compliance Assurance:</strong> 95% accuracy in cold-chain monitoring and food safety protocols
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Problem Prevention:</strong> Predictive issue detection reduces failed deliveries by 60%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Income Growth:</strong> Performance optimization and bonus alerts increase earnings by 25%
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl shadow-lg p-6 border border-cyan-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-cyan-600" />
              Operational Improvements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Real-Time Assistance:</strong> Instant AI support resolves delivery issues 80% faster
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Quality Control:</strong> Product-specific handling reduces damage by 40%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Safety Enhancement:</strong> Smart notification timing improves driving safety by 80%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Career Development:</strong> Performance insights and goal setting boost job satisfaction by 40%
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* AI Features Showcase */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            AI-Powered Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-6 h-6 text-purple-600" />
                <h4 className="font-bold text-purple-900">Cold-Chain AI</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Instant temperature compliance validation for all perishable products
              </p>
              <div className="text-xs text-purple-600 font-semibold">95% Accuracy</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Route className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-blue-900">Smart Routing</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Real-time route optimization with traffic and weather considerations
              </p>
              <div className="text-xs text-blue-600 font-semibold">35% Faster</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-green-900">Compliance Monitor</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Automated SOP access and compliance logging for all deliveries
              </p>
              <div className="text-xs text-green-600 font-semibold">90% Faster</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-6 h-6 text-orange-600" />
                <h4 className="font-bold text-orange-900">Predictive Analytics</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Issue prediction and performance optimization recommendations
              </p>
              <div className="text-xs text-orange-600 font-semibold">60% Prevention</div>
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Implementation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-green-900">Implemented ✅</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• AI Delivery Assistant Chatbot</li>
                <li>• Cold-Chain Compliance Check</li>
                <li>• Route Optimization</li>
                <li>• Handling Instructions</li>
                <li>• SOP Instant Access</li>
                <li>• Issue Resolution Support</li>
              </ul>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <h4 className="font-bold text-yellow-900">In Progress 🚧</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Predictive Issue Detection</li>
                <li>• Performance Analytics</li>
                <li>• Smart Notifications</li>
                <li>• Achievement System</li>
                <li>• Earnings Optimization</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-blue-900">Planned 📋</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Voice Integration</li>
                <li>• Image Analysis</li>
                <li>• Predictive Analytics</li>
                <li>• Multi-language Support</li>
                <li>• Offline Mode</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Experience AI-Powered Delivery</h2>
          <p className="text-lg mb-6 opacity-90">
            Start using these intelligent features today to optimize your deliveries, ensure compliance, and maximize your earnings.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/delivery/dashboard')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/delivery/assigned')}
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              View Deliveries
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/delivery/earnings')}
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Check Earnings
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