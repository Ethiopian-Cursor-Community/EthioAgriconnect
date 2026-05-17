import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import toast from "react-hot-toast";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import {
  Package,
  Trash2,
  Search,
  Filter,
  Eye,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { moderateContent } from "../../lib/gemini";

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
  likes: number;
  createdAt: Date;
}

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [moderatingProduct, setModeratingProduct] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bulkModerating, setBulkModerating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, categoryFilter, statusFilter, products]);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Product[];
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => (p as any).moderationStatus === statusFilter
      );
    }

    setFilteredProducts(filtered);
  };

  // Calculate AI statistics
  const aiStats = {
    total: products.length,
    approved: products.filter((p) => (p as any).moderationStatus === "approved")
      .length,
    flagged: products.filter((p) => (p as any).moderationStatus === "flagged")
      .length,
    pending: products.filter((p) => !(p as any).moderationStatus).length,
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    }
  };

  const handleModerateContent = async (product: Product) => {
    setModeratingProduct(product.id);
    try {
      // Moderate text content
      const textModeration = await moderateContent(
        `${product.name} ${product.description}`,
        "text"
      );

      if (!textModeration.isSafe) {
        toast.error(
          `${product.name}: Content flagged - ${
            textModeration.reason || "Violation detected"
          }`,
          {
            duration: 5000,
          }
        );
        // Update product with moderation status
        await updateDoc(doc(db, "products", product.id), {
          moderationStatus: "flagged",
          moderationReason: textModeration.reason,
          flaggedCategories: textModeration.flaggedCategories || [],
          moderatedAt: new Date(),
        });
        // Refresh products
        await fetchProducts();
      } else {
        toast.success(`${product.name}: AI Approved ✓`);
        await updateDoc(doc(db, "products", product.id), {
          moderationStatus: "approved",
          moderatedAt: new Date(),
        });
        // Refresh products
        await fetchProducts();
      }
    } catch (error) {
      console.error("Moderation error:", error);
      toast.error(`Failed to moderate ${product.name}`);
    } finally {
      setModeratingProduct(null);
    }
  };

  const handleBulkModeration = async () => {
    const pendingProducts = products.filter((p) => !(p as any).moderationStatus);
    
    if (pendingProducts.length === 0) {
      toast.error("No pending products to moderate");
      return;
    }

    if (
      !confirm(
        `Moderate ${pendingProducts.length} pending products with AI? This may take a few moments.`
      )
    )
      return;

    setBulkModerating(true);
    let approved = 0;
    let flagged = 0;
    let failed = 0;

    toast.loading(`Moderating ${pendingProducts.length} products...`, {
      id: "bulk-moderation",
    });

    for (const product of pendingProducts) {
      try {
        const textModeration = await moderateContent(
          `${product.name} ${product.description}`,
          "text"
        );

        if (!textModeration.isSafe) {
          await updateDoc(doc(db, "products", product.id), {
            moderationStatus: "flagged",
            moderationReason: textModeration.reason,
            flaggedCategories: textModeration.flaggedCategories || [],
            moderatedAt: new Date(),
          });
          flagged++;
        } else {
          await updateDoc(doc(db, "products", product.id), {
            moderationStatus: "approved",
            moderatedAt: new Date(),
          });
          approved++;
        }
      } catch (error) {
        console.error(`Failed to moderate ${product.name}:`, error);
        failed++;
      }
    }

    await fetchProducts();
    setBulkModerating(false);

    toast.success(
      `Bulk moderation complete! ✓ ${approved} approved, ⚠️ ${flagged} flagged, ✗ ${failed} failed`,
      {
        id: "bulk-moderation",
        duration: 6000,
      }
    );
  };

  const categories = [
    "all",
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "herbs",
    "other",
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            AI-powered content moderation and product management
          </p>
        </div>

        {/* AI Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {aiStats.total}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {aiStats.approved}
                </p>
                <p className="text-xs text-gray-500">
                  {aiStats.total > 0
                    ? Math.round((aiStats.approved / aiStats.total) * 100)
                    : 0}
                  % auto-approved
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Flagged</p>
                <p className="text-2xl font-bold text-red-600">
                  {aiStats.flagged}
                </p>
                <p className="text-xs text-gray-500">Needs review</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {aiStats.pending}
                </p>
                <p className="text-xs text-gray-500">Not yet moderated</p>
              </div>
              <Loader2 className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* AI Efficiency Banner */}
        {aiStats.total > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h3 className="font-semibold text-lg">
                    AI Moderation Active 🤖
                  </h3>
                  <p className="text-sm text-purple-100">
                    AI has automatically processed {aiStats.approved} products,
                    saving approximately{" "}
                    {Math.round((aiStats.approved * 5) / 60)} hours of manual
                    review time. {aiStats.flagged} items flagged for your
                    attention.
                  </p>
                </div>
              </div>
              {aiStats.pending > 0 && (
                <button
                  onClick={handleBulkModeration}
                  disabled={bulkModerating}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition disabled:bg-gray-200 disabled:text-gray-500 flex items-center gap-2"
                >
                  {bulkModerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Moderating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Moderate All ({aiStats.pending})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition text-sm ${
                      categoryFilter === cat
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                AI Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {["all", "approved", "flagged", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status === "pending" ? "" : status)
                    }
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition text-sm ${
                      statusFilter ===
                      (status === "pending" ? "" : status)
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status === "pending" ? "Not Reviewed" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    by {product.farmerName}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Category:</span>{" "}
                      <span className="capitalize">{product.category}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Quantity:</span>{" "}
                      {product.quantity} kg
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${product.pricePerUnit}/unit
                    </p>
                    <p className="text-sm text-gray-500">
                      ❤️ {product.likes} likes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleModerateContent(product)}
                      disabled={moderatingProduct === product.id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 text-sm"
                      title="AI Content Moderation"
                    >
                      {moderatingProduct === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* AI Moderation Status */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {(product as any).moderationStatus === "approved" ? (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3" />
                          <span className="font-medium">AI Approved</span>
                        </div>
                        {(product as any).moderatedAt && (
                          <span className="text-gray-500">
                            {new Date(
                              (product as any).moderatedAt.seconds * 1000
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (product as any).moderationStatus === "flagged" ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span className="font-medium">AI Flagged</span>
                        </div>
                        {(product as any).moderationReason && (
                          <p className="text-xs text-red-600">
                            Reason: {(product as any).moderationReason}
                          </p>
                        )}
                        {(product as any).flaggedCategories &&
                          (product as any).flaggedCategories.length > 0 && (
                            <p className="text-xs text-gray-600">
                              Categories:{" "}
                              {(product as any).flaggedCategories.join(", ")}
                            </p>
                          )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs w-fit">
                        <Loader2 className="w-3 h-3" />
                        <span className="font-medium">Pending AI Review</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductManagement;
