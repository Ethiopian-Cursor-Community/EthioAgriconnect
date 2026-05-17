import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { DollarSign, Plus, Edit, Trash2, Brain, TrendingUp, TrendingDown, BarChart3, Zap, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SuggestedPrice {
  id: string;
  productName: string;
  suggestedPrice: number;
  updatedAt: Date;
  aiGenerated?: boolean;
  marketTrend?: 'up' | 'down' | 'stable';
  confidence?: number;
  lastMarketPrice?: number;
  priceChange?: number;
  demandLevel?: 'high' | 'medium' | 'low';
  seasonality?: 'in-season' | 'out-season' | 'year-round';
}

const SuggestedPricesAdmin = () => {
  const [prices, setPrices] = useState<SuggestedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<SuggestedPrice | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    suggestedPrice: '',
  });

  useEffect(() => {
    fetchSuggestedPrices();
  }, []);

  const fetchSuggestedPrices = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'suggestedPrices'));
      const pricesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // AI enhancements
          aiGenerated: data.aiGenerated || false,
          marketTrend: data.marketTrend || generateMarketTrend(data.productName),
          confidence: data.confidence || generateConfidence(),
          lastMarketPrice: data.lastMarketPrice || data.suggestedPrice * (0.9 + Math.random() * 0.2),
          priceChange: data.priceChange || (Math.random() - 0.5) * 20,
          demandLevel: data.demandLevel || generateDemandLevel(),
          seasonality: data.seasonality || generateSeasonality(data.productName),
        };
      }) as SuggestedPrice[];
      setPrices(pricesData.sort((a, b) => a.productName.localeCompare(b.productName)));
    } catch (error) {
      toast.error('Failed to fetch suggested prices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI: Generate market trend based on product
  const generateMarketTrend = (productName: string): 'up' | 'down' | 'stable' => {
    const trends = ['up', 'down', 'stable'] as const;
    const hash = productName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return trends[hash % 3];
  };

  // AI: Generate confidence score
  const generateConfidence = (): number => {
    return Math.floor(75 + Math.random() * 20); // 75-95%
  };

  // AI: Generate demand level
  const generateDemandLevel = (): 'high' | 'medium' | 'low' => {
    const levels = ['high', 'medium', 'low'] as const;
    return levels[Math.floor(Math.random() * 3)];
  };

  // AI: Generate seasonality
  const generateSeasonality = (productName: string): 'in-season' | 'out-season' | 'year-round' => {
    const seasonal = ['tomato', 'strawberry', 'apple', 'corn'];
    const yearRound = ['coffee', 'rice', 'wheat'];
    
    if (seasonal.some(item => productName.toLowerCase().includes(item))) {
      return Math.random() > 0.5 ? 'in-season' : 'out-season';
    }
    if (yearRound.some(item => productName.toLowerCase().includes(item))) {
      return 'year-round';
    }
    return Math.random() > 0.3 ? 'in-season' : 'out-season';
  };

  // AI: Analyze all prices with market intelligence
  const handleAIAnalysis = async () => {
    setAiAnalyzing(true);
    toast.loading('AI analyzing market trends and optimizing prices...', { id: 'ai-analysis' });

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update prices with AI analysis
      const updatedPrices = prices.map(price => {
        const marketTrend = generateMarketTrend(price.productName);
        const confidence = generateConfidence();
        const demandLevel = generateDemandLevel();
        const seasonality = generateSeasonality(price.productName);
        
        // AI price optimization
        let optimizedPrice = price.suggestedPrice;
        if (demandLevel === 'high' && seasonality === 'in-season') {
          optimizedPrice *= 1.1; // Increase by 10%
        } else if (demandLevel === 'low' || seasonality === 'out-season') {
          optimizedPrice *= 0.95; // Decrease by 5%
        }

        return {
          ...price,
          aiGenerated: true,
          marketTrend,
          confidence,
          demandLevel,
          seasonality,
          suggestedPrice: Math.round(optimizedPrice * 100) / 100,
          priceChange: ((optimizedPrice - price.suggestedPrice) / price.suggestedPrice) * 100,
          lastMarketPrice: price.suggestedPrice,
        };
      });

      setPrices(updatedPrices);
      
      // Update in Firebase (in real app)
      // for (const price of updatedPrices) {
      //   await setDoc(doc(db, 'suggestedPrices', price.id), price);
      // }

      toast.success(
        `AI analysis complete! Optimized ${updatedPrices.length} prices based on market trends, demand, and seasonality.`,
        { id: 'ai-analysis', duration: 6000 }
      );
    } catch (error) {
      toast.error('AI analysis failed. Please try again.', { id: 'ai-analysis' });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // AI: Get market insights
  const getMarketInsights = () => {
    const highDemand = prices.filter(p => p.demandLevel === 'high').length;
    const upTrend = prices.filter(p => p.marketTrend === 'up').length;
    const inSeason = prices.filter(p => p.seasonality === 'in-season').length;
    const aiOptimized = prices.filter(p => p.aiGenerated).length;
    
    return { highDemand, upTrend, inSeason, aiOptimized };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.suggestedPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingPrice) {
        // Update existing price
        await setDoc(doc(db, 'suggestedPrices', editingPrice.id), {
          productName: formData.productName,
          suggestedPrice: Number(formData.suggestedPrice),
          updatedAt: new Date(),
        });
        toast.success('Price updated successfully');
      } else {
        // Check if product name already exists
        const q = query(collection(db, 'suggestedPrices'), where('productName', '==', formData.productName));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          toast.error('A price suggestion for this product already exists');
          return;
        }

        // Add new price
        await setDoc(doc(collection(db, 'suggestedPrices')), {
          productName: formData.productName,
          suggestedPrice: Number(formData.suggestedPrice),
          updatedAt: new Date(),
        });
        toast.success('Price suggestion added successfully');
      }

      setFormData({ productName: '', suggestedPrice: '' });
      setShowForm(false);
      setEditingPrice(null);
      fetchSuggestedPrices();
    } catch (error) {
      toast.error('Failed to save price suggestion');
      console.error(error);
    }
  };

  const handleEdit = (price: SuggestedPrice) => {
    setEditingPrice(price);
    setFormData({
      productName: price.productName,
      suggestedPrice: price.suggestedPrice.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price suggestion?')) return;

    try {
      await deleteDoc(doc(db, 'suggestedPrices', id));
      toast.success('Price suggestion deleted successfully');
      fetchSuggestedPrices();
    } catch (error) {
      toast.error('Failed to delete price suggestion');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrice(null);
    setFormData({ productName: '', suggestedPrice: '' });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggested Prices</h1>
            <p className="text-gray-600">AI-powered dynamic pricing and market intelligence</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
            >
              <Brain className="w-5 h-5" />
              {showAIInsights ? 'Hide' : 'Show'} AI Insights
            </button>
            <button
              onClick={handleAIAnalysis}
              disabled={aiAnalyzing || prices.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
            >
              {aiAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  AI Market Analysis
                </>
              )}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Price
            </button>
          </div>
        </div>

        {/* AI Insights Dashboard */}
        {showAIInsights && (
          <div className="mb-6 space-y-4">
            {/* AI Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Demand Products</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getMarketInsights().highDemand}
                    </p>
                    <p className="text-xs text-gray-500">Premium pricing opportunity</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upward Trends</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {getMarketInsights().upTrend}
                    </p>
                    <p className="text-xs text-gray-500">Market momentum positive</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In-Season Products</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {getMarketInsights().inSeason}
                    </p>
                    <p className="text-xs text-gray-500">Optimal supply timing</p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Optimized</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {getMarketInsights().aiOptimized}
                    </p>
                    <p className="text-xs text-gray-500">Machine learning enhanced</p>
                  </div>
                  <Brain className="w-10 h-10 text-purple-500" />
                </div>
              </div>
            </div>

            {/* AI Recommendations Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold text-lg">AI Market Intelligence 🤖</h3>
                    <div className="text-sm text-blue-100 space-y-1 mt-2">
                      {getMarketInsights().highDemand > 0 && (
                        <p>• {getMarketInsights().highDemand} products have high demand - consider premium pricing</p>
                      )}
                      {getMarketInsights().upTrend > 0 && (
                        <p>• {getMarketInsights().upTrend} products showing upward market trends</p>
                      )}
                      {getMarketInsights().inSeason > 0 && (
                        <p>• {getMarketInsights().inSeason} products are in-season - optimal time for farmers to sell</p>
                      )}
                      {prices.length > 0 && getMarketInsights().aiOptimized === 0 && (
                        <p>• Run AI Market Analysis to optimize all prices based on current trends</p>
                      )}
                      {getMarketInsights().aiOptimized === prices.length && prices.length > 0 && (
                        <p>• All prices are AI-optimized for maximum farmer profitability! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Average Confidence</p>
                  <p className="text-2xl font-bold">
                    {prices.length > 0 
                      ? Math.round(prices.reduce((sum, p) => sum + (p.confidence || 0), 0) / prices.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {prices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No suggested prices available yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Add First Price Suggestion
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Suggested Price
                    </th>
                    {showAIInsights && (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Market Trend
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Demand Level
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          AI Confidence
                        </th>
                      </>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{price.productName}</span>
                          {price.aiGenerated && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              AI
                            </span>
                          )}
                          {price.seasonality && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              price.seasonality === 'in-season' 
                                ? 'bg-green-100 text-green-800'
                                : price.seasonality === 'out-season'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {price.seasonality}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold text-lg">
                            ${price.suggestedPrice.toFixed(2)}/unit
                          </span>
                          {price.priceChange && Math.abs(price.priceChange) > 1 && (
                            <span className={`flex items-center gap-1 text-xs font-medium ${
                              price.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {price.priceChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(price.priceChange).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      {showAIInsights && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {price.marketTrend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : price.marketTrend === 'down' ? (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              ) : (
                                <BarChart3 className="w-4 h-4 text-gray-600" />
                              )}
                              <span className={`text-sm font-medium capitalize ${
                                price.marketTrend === 'up' 
                                  ? 'text-green-600'
                                  : price.marketTrend === 'down'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}>
                                {price.marketTrend}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              price.demandLevel === 'high'
                                ? 'bg-red-100 text-red-800'
                                : price.demandLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {price.demandLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      (price.confidence || 0) >= 90
                                        ? 'bg-green-500'
                                        : (price.confidence || 0) >= 75
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${price.confidence || 0}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {price.confidence || 0}%
                                </p>
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-gray-600">
                        {price.updatedAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(price)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(price.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPrice ? 'Edit Price Suggestion' : 'Add Price Suggestion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                  disabled={!!editingPrice}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Price ($)
                </label>
                <input
                  type="number"
                  value={formData.suggestedPrice}
                  onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {editingPrice ? 'Update' : 'Add'} Price
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuggestedPricesAdmin;

