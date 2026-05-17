import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AIChatbot from "../../components/AIChatbot";
import {
  ShoppingCart,
  User,
  ArrowLeft,
  Heart,
  ChefHat,
  Info,
  Loader2,
} from "lucide-react";
import { getRecipeSuggestion, getProductInfo } from "../../lib/gemini";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  imageUrl: string;
  farmerName: string;
  farmerId: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      if (!id) return;

      const productDoc = await getDoc(doc(db, "products", id));
      if (productDoc.exists()) {
        const productData = {
          id: productDoc.id,
          ...productDoc.data(),
        } as Product;
        setProduct(productData);

        const q = query(
          collection(db, "suggestedPrices"),
          where("productName", "==", productData.name)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSuggestedPrice(snapshot.docs[0].data().suggestedPrice);
        }
      } else {
        toast.error("Product not found");
        navigate("/marketplace");
      }
    } catch (error) {
      toast.error("Failed to fetch product details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!currentUser) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(
      (item: any) => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        pricePerUnit: product.pricePerUnit,
        imageUrl: product.imageUrl,
        farmerName: product.farmerName,
        farmerId: product.farmerId,
        quantity: 1,
        maxQuantity: product.quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
  };

  const handleOrderNow = () => {
    if (!currentUser) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    setShowOrderForm(true);
  };

  const handleAddToFavorites = () => {
    if (!currentUser) {
      toast.error("Please login to add to favorites");
      navigate("/login");
      return;
    }
    toast.success("Added to favorites!");
  };

  const handleGetRecipe = async () => {
    if (!product) return;

    setLoadingRecipe(true);
    setShowRecipe(true);
    try {
      const recipeData = await getRecipeSuggestion(product.name);
      setRecipe(recipeData);
    } catch (error) {
      console.error("Failed to get recipe:", error);
      toast.error("Failed to load recipe");
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleGetProductInfo = async () => {
    if (!product) return;

    setLoadingInfo(true);
    setShowInfo(true);
    try {
      const info = await getProductInfo(product.name);
      setProductInfo(info);
    } catch (error) {
      console.error("Failed to get product info:", error);
      toast.error("Failed to load product information");
    } finally {
      setLoadingInfo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {currentUser ? (
        <Navbar />
      ) : (
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-green-800">
              EthioAgriConnect
            </span>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Login
            </button>
          </div>
        </nav>
      )}

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sold by</p>
                      <p className="font-semibold text-gray-900">
                        {product.farmerName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {product.category}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Available Quantity</span>
                  <span className="font-medium text-gray-900">
                    {product.quantity} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Price per Unit</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${product.pricePerUnit}
                  </span>
                </div>
                {suggestedPrice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">
                        Suggested Market Price:
                      </span>{" "}
                      ${suggestedPrice.toFixed(2)}/unit
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={handleOrderNow}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Order Now
                </button>
                <button
                  onClick={addToCart}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleGetRecipe}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-medium"
                >
                  <ChefHat className="w-5 h-5" />
                  Get Recipe
                </button>
                <button
                  onClick={handleGetProductInfo}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  <Info className="w-5 h-5" />
                  Product Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Place Order
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  min="1"
                  max={product.quantity}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per unit</span>
                  <span className="font-medium">${product.pricePerUnit}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    ${(orderQuantity * product.pricePerUnit).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    addToCart();
                    setShowOrderForm(false);
                    navigate("/consumer/cart");
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recipe Suggestion
              </h2>
              <button
                onClick={() => setShowRecipe(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {loadingRecipe ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : recipe ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {recipe.recipe.title}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>⏱️ {recipe.recipe.prepTime}</span>
                    <span>Difficulty: {recipe.recipe.difficulty}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ingredients:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {recipe.recipe.ingredients.map(
                      (ing: string, idx: number) => (
                        <li key={idx}>{ing}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Instructions:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {recipe.recipe.instructions.map(
                      (step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      )
                    )}
                  </ol>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Product Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Product Information
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {loadingInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : productInfo ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Origin:</h3>
                  <p className="text-gray-700">{productInfo.origin}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description:
                  </h3>
                  <p className="text-gray-700">{productInfo.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nutritional Facts:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(productInfo.nutritionalFacts).map(
                      ([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-900">
                            {key}:
                          </span>
                          <span className="ml-2 text-gray-700">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Storage Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {productInfo.storageTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cooking Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {productInfo.cookingTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Footer />
      <AIChatbot productName={product?.name} />
    </div>
  );
};

export default ProductDetails;
