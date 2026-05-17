import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { uploadImageToCloudinary, UploadProgress } from "../../lib/cloudinary";
import { formatBytes, formatTime } from "../../lib/formatUtils";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Upload,
  Sparkles,
  Loader2,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import {
  generateProductDescription,
  categorizeProduct,
  getPricingGuidance,
  moderateContent,
} from "../../lib/gemini";

const AddProduct = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "vegetables",
    quantity: "",
    pricePerUnit: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState(false);
  const [aiCategorized, setAiCategorized] = useState(false);
  const [pricingGuidance, setPricingGuidance] = useState<{
    suggestedPrice: number;
    isCompetitive: boolean;
    recommendation: string;
    marketInsights: string;
  } | null>(null);
  const [showPricingGuidance, setShowPricingGuidance] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );

  const categories = [
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "herbs",
    "other",
  ];

  // Auto-categorize when image or name changes
  useEffect(() => {
    const autoCategorize = async () => {
      if (formData.name && image && !aiCategorized) {
        setAiLoading(true);
        try {
          // Convert image file to base64 data URL
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
              const result = await categorizeProduct(
                formData.name,
                formData.description || "",
                base64String
              );
              if (result.category && categories.includes(result.category)) {
                setFormData((prev) => ({ ...prev, category: result.category }));
                setAiCategorized(true);
                toast.success(`AI categorized as: ${result.category}`);
              }
            } catch (error) {
              console.error("Auto-categorization failed:", error);
            } finally {
              setAiLoading(false);
            }
          };
          reader.onerror = () => {
            console.error("Failed to read image file");
            setAiLoading(false);
          };
          reader.readAsDataURL(image);
        } catch (error) {
          console.error("Auto-categorization failed:", error);
          setAiLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(autoCategorize, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData.name, image, aiCategorized]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAiCategorized(false); // Reset to allow re-categorization
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error("Please enter a product name first");
      return;
    }

    setAiLoading(true);
    try {
      const bulletPoints = [
        `Product: ${formData.name}`,
        formData.description || "Fresh produce",
        `Category: ${formData.category}`,
      ];

      const description = await generateProductDescription(
        formData.name,
        formData.category,
        bulletPoints
      );

      setFormData((prev) => ({ ...prev, description }));
      setAiGeneratedDescription(true);
      toast.success("AI-generated description created!");
    } catch (error) {
      toast.error("Failed to generate description");
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetPricingGuidance = async () => {
    if (!formData.name || !formData.pricePerUnit) {
      toast.error("Please enter product name and price first");
      return;
    }

    setAiLoading(true);
    try {
      // Fetch similar products for market data
      const productsSnapshot = await getDocs(collection(db, "products"));
      const allProducts = productsSnapshot.docs
        .map((doc) => ({
          name: doc.data().name,
          price: doc.data().pricePerUnit,
        }))
        .filter((p) =>
          p.name
            .toLowerCase()
            .includes(formData.name.toLowerCase().split(" ")[0])
        );

      const currentPrice = Number(formData.pricePerUnit);
      const guidance = await getPricingGuidance(
        formData.name,
        currentPrice,
        allProducts
      );

      setPricingGuidance(guidance);
      setShowPricingGuidance(true);
      toast.success("Pricing guidance generated!");
    } catch (error) {
      toast.error("Failed to get pricing guidance");
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestedPrice = () => {
    if (pricingGuidance) {
      setFormData((prev) => ({
        ...prev,
        pricePerUnit: pricingGuidance.suggestedPrice.toFixed(2),
      }));
      toast.success("Suggested price applied!");
      setShowPricingGuidance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Content moderation before submission - include all product details
      const fullProductInfo = `Product Name: ${formData.name}
Description: ${formData.description}
Category: ${formData.category}
Quantity: ${formData.quantity} kg
Price: $${formData.pricePerUnit} per unit
Farmer: ${userData?.name}`;

      const moderationResult = await moderateContent(fullProductInfo, "text");

      if (!moderationResult.isSafe) {
        // Check if it's just a warning about incomplete data
        const isIncompleteWarning =
          moderationResult.reason?.toLowerCase().includes("incomplete") ||
          moderationResult.reason?.toLowerCase().includes("deficiency");

        if (isIncompleteWarning) {
          // Allow submission but log the warning
          console.warn("Content moderation warning:", moderationResult.reason);
        } else {
          // Block submission for actual safety issues
          toast.error(
            `Content moderation: ${
              moderationResult.reason || "Content flagged"
            }`
          );
          setLoading(false);
          return;
        }
      }

      let imageUrl = "";

      if (image) {
        try {
          setUploadProgress({
            progress: 0,
            uploadedBytes: 0,
            totalBytes: image.size,
            speed: 0,
            timeRemaining: 0,
          });

          imageUrl = await uploadImageToCloudinary(
            image,
            "products",
            (progress) => {
              setUploadProgress(progress);
            }
          );

          setUploadProgress(null);
          toast.success("Image uploaded successfully!", { duration: 2000 });

          // Moderate image if URL is available
          if (imageUrl) {
            const imageModeration = await moderateContent(imageUrl, "image");
            if (!imageModeration.isSafe) {
              toast.error(
                "Image moderation failed. Please upload a different image."
              );
              setLoading(false);
              return;
            }
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          setUploadProgress(null);
          toast.error(
            `Failed to upload image: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error"
            }`
          );
          setLoading(false);
          return;
        }
      }

      await addDoc(collection(db, "products"), {
        ...formData,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
        imageUrl,
        farmerId: userData?.uid,
        farmerName: userData?.name,
        likes: 0,
        createdAt: new Date(),
        aiGenerated: aiGeneratedDescription,
        aiCategorized: aiCategorized,
      });

      toast.success("Product added successfully!");
      navigate("/farmer/products");
    } catch (error) {
      toast.error("Failed to add product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Add New Product
        </h1>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Fresh Tomatoes"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={aiLoading || !formData.name}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setAiGeneratedDescription(false);
                }}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your product... or use AI to generate"
              />
              {aiGeneratedDescription && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI-generated description</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price per Unit ($)
                  </label>
                  <button
                    type="button"
                    onClick={handleGetPricingGuidance}
                    disabled={
                      aiLoading || !formData.name || !formData.pricePerUnit
                    }
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="w-3 h-3" />
                        Get AI Guidance
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg mb-4"
                    />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  )}
                  <p className="text-sm text-gray-600">
                    {image ? image.name : "Click to upload image"}
                  </p>
                </label>
              </div>

              {/* Upload Progress Indicator */}
              {uploadProgress && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Uploading...
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {uploadProgress.progress.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-blue-200 rounded-full h-2.5 mb-3">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    ></div>
                  </div>

                  {/* Upload Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Speed:</span>{" "}
                      {formatBytes(uploadProgress.speed)}/s
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>{" "}
                      {formatBytes(uploadProgress.uploadedBytes)} /{" "}
                      {formatBytes(uploadProgress.totalBytes)}
                    </div>
                    <div>
                      <span className="font-medium">Time left:</span>{" "}
                      {formatTime(uploadProgress.timeRemaining)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Guidance Modal */}
            {showPricingGuidance && pricingGuidance && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-blue-900">
                    AI Pricing Guidance
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPricingGuidance(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Suggested Price:</span>
                    <span className="font-bold text-green-600">
                      ${pricingGuidance.suggestedPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">Competitive:</span>
                    <span
                      className={`font-semibold ${
                        pricingGuidance.isCompetitive
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {pricingGuidance.isCompetitive ? "Yes" : "Could improve"}
                    </span>
                  </div>
                  <p className="text-gray-600 italic">
                    {pricingGuidance.recommendation}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {pricingGuidance.marketInsights}
                  </p>
                  <button
                    type="button"
                    onClick={applySuggestedPrice}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Apply Suggested Price
                  </button>
                </div>
              </div>
            )}

            {aiCategorized && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Product automatically categorized using AI
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/farmer/products")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;
