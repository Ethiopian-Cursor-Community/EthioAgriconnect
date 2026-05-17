import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Sparkles,
  MessageCircle,
  Search,
  ShoppingCart,
  Package,
  Star,
  ChefHat,
  Heart,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
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

const ConsumerAIShowcase = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chatbot' | 'marketplace' | 'productDetails'>('chatbot');

  const features = {
    chatbot: [
      {
        icon: <MessageCircle className="w-6 h-6" />,
        name: '24/7 AI Support',
        before: 'Wait for customer service during business hours',
        beforeExample: 'Example: "It\'s 10 PM and I have a question about delivery. Guess I\'ll wait until tomorrow..."',
        after: 'Instant answers anytime, day or night',
        afterExample: 'Example: "Hi! I can help you right now. Delivery typically takes 2-3 days. What else can I help with?"',
        impact: '24/7 availability',
        color: 'purple',
      },
      {
        icon: <Package className="w-6 h-6" />,
        name: 'Product Questions',
        before: 'Search through product descriptions manually',
        beforeExample: 'Example: "Is this organic? How fresh is it? I need to read everything carefully..."',
        after: 'Ask AI anything about any product instantly',
        afterExample: 'Example: "Yes, these tomatoes are organic and freshly harvested yesterday. They\'re perfect for salads!"',
        impact: '70% faster information',
        color: 'blue',
      },
      {
        icon: <ChefHat className="w-6 h-6" />,
        name: 'Recipe Suggestions',
        before: 'Google recipes separately after shopping',
        beforeExample: 'Example: "I bought tomatoes... now let me search Google for tomato recipes"',
        after: 'AI suggests recipes based on your cart items',
        afterExample: 'Example: "With tomatoes, try: Caprese Salad, Tomato Soup, or Pasta Marinara. Want the recipe?"',
        impact: 'Instant recipe ideas',
        color: 'green',
      },
      {
        icon: <Heart className="w-6 h-6" />,
        name: 'Nutritional Info',
        before: 'Look up nutrition facts on external websites',
        beforeExample: 'Example: "How many calories in tomatoes? Let me check another website..."',
        after: 'AI provides detailed nutrition instantly',
        afterExample: 'Example: "Tomatoes: 18 cal/100g, rich in Vitamin C, lycopene, and antioxidants. Great for heart health!"',
        impact: 'Instant health insights',
        color: 'red',
      },
    ],
    marketplace: [
      {
        icon: <Search className="w-6 h-6" />,
        name: 'Natural Language Search',
        before: 'Use exact keywords to find products',
        beforeExample: 'Example: Typing "tomato" and hoping to find what you need',
        after: 'Search naturally like talking to a person',
        afterExample: 'Example: "organic tomatoes for salad" → AI finds organic tomatoes and suggests salad ingredients',
        impact: '60% better search results',
        color: 'purple',
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        name: 'Smart Recommendations',
        before: 'Browse all products manually',
        beforeExample: 'Example: "Let me scroll through 100 products to find what I need..."',
        after: 'AI suggests products based on your preferences',
        afterExample: 'Example: "Based on your previous orders, you might like these organic vegetables and fresh herbs"',
        impact: '3x higher engagement',
        color: 'blue',
      },
      {
        icon: <Zap className="w-6 h-6" />,
        name: 'Intent Understanding',
        before: 'Search multiple times with different keywords',
        beforeExample: 'Example: Searching "tomato", then "tomatoes", then "fresh tomato"...',
        after: 'AI understands what you mean the first time',
        afterExample: 'Example: "something red for pasta" → AI shows tomatoes, peppers, and suggests pasta sauce ingredients',
        impact: '50% fewer searches',
        color: 'green',
      },
      {
        icon: <Award className="w-6 h-6" />,
        name: 'Quality Insights',
        before: 'No way to know product quality before buying',
        beforeExample: 'Example: "Is this farmer reliable? Are the products fresh? I have no idea..."',
        after: 'AI-powered quality badges and ratings',
        afterExample: 'Example: "⭐ Premium Quality | 4.8★ rating | 95% positive reviews | Fresh daily"',
        impact: 'Better purchase decisions',
        color: 'yellow',
      },
    ],
    productDetails: [
      {
        icon: <ChefHat className="w-6 h-6" />,
        name: 'Recipe Generator',
        before: 'No recipe ideas for products',
        beforeExample: 'Example: "I want to buy these tomatoes but don\'t know what to cook..."',
        after: 'AI generates custom recipes instantly',
        afterExample: 'Example: "Try this: Tomato Bruschetta - Toast bread, rub with garlic, top with diced tomatoes, basil, olive oil"',
        impact: 'Cooking inspiration',
        color: 'green',
      },
      {
        icon: <Heart className="w-6 h-6" />,
        name: 'Nutritional Analysis',
        before: 'No nutritional information available',
        beforeExample: 'Example: "Are tomatoes healthy? What vitamins do they have? No info here..."',
        after: 'Detailed nutrition facts with health benefits',
        afterExample: 'Example: "Nutrition per 100g: 18 cal, Vitamin C (21mg), Lycopene (antioxidant). Benefits: Heart health, skin health"',
        impact: 'Informed health choices',
        color: 'red',
      },
      {
        icon: <Package className="w-6 h-6" />,
        name: 'Storage Tips',
        before: 'No guidance on how to store products',
        beforeExample: 'Example: "Should I refrigerate tomatoes? How long do they last? I\'ll just guess..."',
        after: 'AI provides expert storage advice',
        afterExample: 'Example: "Store at room temperature for best flavor. Refrigerate only if very ripe. Lasts 5-7 days"',
        impact: 'Reduce food waste',
        color: 'blue',
      },
      {
        icon: <Star className="w-6 h-6" />,
        name: 'Smart Pairing',
        before: 'No suggestions for complementary products',
        beforeExample: 'Example: "What else goes well with tomatoes? Let me think..."',
        after: 'AI suggests perfect product combinations',
        afterExample: 'Example: "Pairs perfectly with: Fresh Basil, Mozzarella, Olive Oil. Customers who bought this also bought..."',
        impact: 'Complete meal planning',
        color: 'purple',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Hackathon Results</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Shopping Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how AI integration transformed the Consumer Portal, bringing intelligent search,
            24/7 support, and personalized recommendations to enhance your shopping journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">AI Support</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">70%</div>
            <div className="text-gray-600">Faster Shopping</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
            <div className="text-gray-600">Better Discovery</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
            <div className="text-3xl font-bold text-pink-600 mb-2">12+</div>
            <div className="text-gray-600">AI Features</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'chatbot'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>AI Chatbot</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'marketplace'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Marketplace</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('productDetails')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'productDetails'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>Product Details</span>
            </div>
          </button>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Key Benefits
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>24/7 Support:</strong> Get instant answers anytime with AI chatbot assistance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Faster Shopping:</strong> Natural language search finds products 70% faster
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Better Decisions:</strong> AI provides nutrition info, recipes, and storage tips
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Personalization:</strong> Smart recommendations based on your preferences
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Shopping Improvements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Smart Search:</strong> AI understands natural language and intent
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Recipe Ideas:</strong> Get cooking inspiration for every product
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Health Insights:</strong> Detailed nutritional information at your fingertips
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Quality Badges:</strong> AI-powered ratings help you choose the best
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Experience AI-Powered Shopping</h2>
          <p className="text-lg mb-6 opacity-90">
            Start using these intelligent features today for a smarter, faster, and more enjoyable shopping experience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Marketplace
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Try AI Chatbot
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConsumerAIShowcase;
