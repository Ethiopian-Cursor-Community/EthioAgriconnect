import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, Sparkles, DollarSign, Loader2 } from 'lucide-react';
import { predictProductDemand, generateInventoryAlerts, optimizeProductListing } from '../../lib/gemini';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  imageUrl: string;
  likes: number;
  aiInsights?: {
    demandLevel?: string;
    recommendation?: string;
    optimizationScore?: number;
    suggestions?: Array<{ suggestion: string; priority: string; impact: string }>;
  };
}

interface InventoryAlert {
  productId: string;
  productName: string;
  alertType: string;
  severity: string;
  message: string;
  action: string;
}

const MyProducts = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [userData]);

  useEffect(() => {
    if (products.length > 0 && showAIInsights) {
      generateAIInsights();
    }
  }, [products, showAIInsights]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), where('farmerId', '==', userData?.uid));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (aiLoading || products.length === 0) return;
    
    setAiLoading(true);
    try {
      // Generate inventory alerts
      const alerts = await generateInventoryAlerts(
        products.map(p => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          category: p.category,
          pricePerUnit: p.pricePerUnit,
        }))
      );
      setInventoryAlerts(alerts);

      // Generate AI insights for each product
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            // Predict demand
            const demandPrediction = await predictProductDemand(
              product.name,
              product.category,
              undefined,
              product.quantity
            );

            // Optimize listing
            const optimization = await optimizeProductListing({
              name: product.name,
              description: product.description,
              category: product.category,
              pricePerUnit: product.pricePerUnit,
              imageUrl: product.imageUrl,
              likes: product.likes,
            });

            return {
              ...product,
              aiInsights: {
                demandLevel: demandPrediction.demandLevel,
                recommendation: demandPrediction.recommendation,
                optimizationScore: optimization.score,
                suggestions: optimization.suggestions.slice(0, 2),
              },
            };
          } catch (error) {
            console.error(`Failed to generate insights for ${product.name}:`, error);
            return product;
          }
        })
      );

      setProducts(updatedProducts);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate AI insights');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await updateDoc(doc(db, 'products', editingProduct.id), {
        name: editingProduct.name,
        description: editingProduct.description,
        quantity: editingProduct.quantity,
        pricePerUnit: editingProduct.pricePerUnit,
      });

      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
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
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              disabled={aiLoading || products.length === 0}
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
                  {showAIInsights ? 'Hide AI Insights' : 'Show AI Insights'}
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/farmer/add-product')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Inventory Alerts */}
        {showAIInsights && inventoryAlerts.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Inventory Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventoryAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'high'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-sm text-gray-600 mt-2 italic">{alert.action}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        alert.alertType === 'low_stock'
                          ? 'bg-red-100 text-red-700'
                          : alert.alertType === 'high_demand'
                          ? 'bg-green-100 text-green-700'
                          : alert.alertType === 'price_adjustment'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {alert.alertType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Start adding products to your inventory</p>
            <button
              onClick={() => navigate('/farmer/add-product')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Category:</span>{' '}
                      <span className="capitalize">{product.category}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Quantity:</span> {product.quantity} kg
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${product.pricePerUnit}/unit
                    </p>
                    <p className="text-sm text-gray-500">❤️ {product.likes} likes</p>
                  </div>
                  {/* AI Insights */}
                  {showAIInsights && product.aiInsights && (
                    <div className="mb-4 space-y-2">
                      {/* Demand Level */}
                      {product.aiInsights.demandLevel && (
                        <div
                          className={`flex items-center gap-2 p-2 rounded text-sm ${
                            product.aiInsights.demandLevel === 'very high' || product.aiInsights.demandLevel === 'high'
                              ? 'bg-green-50 text-green-700'
                              : product.aiInsights.demandLevel === 'medium'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium capitalize">{product.aiInsights.demandLevel} demand</span>
                        </div>
                      )}

                      {/* Recommendation */}
                      {product.aiInsights.recommendation && (
                        <div className="bg-purple-50 p-2 rounded text-sm text-purple-700">
                          <p className="font-medium">💡 {product.aiInsights.recommendation}</p>
                        </div>
                      )}

                      {/* Optimization Score */}
                      {product.aiInsights.optimizationScore !== undefined && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                          <span className="text-blue-700 font-medium">Listing Score:</span>
                          <span
                            className={`font-bold ${
                              product.aiInsights.optimizationScore >= 80
                                ? 'text-green-600'
                                : product.aiInsights.optimizationScore >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {product.aiInsights.optimizationScore}/100
                          </span>
                        </div>
                      )}

                      {/* Top Suggestion */}
                      {product.aiInsights.suggestions && product.aiInsights.suggestions.length > 0 && (
                        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800">
                          <div className="flex items-start gap-1">
                            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{product.aiInsights.suggestions[0].suggestion}</p>
                              <p className="text-yellow-700 mt-1">{product.aiInsights.suggestions[0].impact}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Unit ($)</label>
                <input
                  type="number"
                  value={editingProduct.pricePerUnit}
                  onChange={(e) => setEditingProduct({ ...editingProduct, pricePerUnit: Number(e.target.value) })}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
