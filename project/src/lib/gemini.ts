// Gemini API Configuration and Service
const GEMINI_API_KEY = "AIzaSyCXUfFGgCS3yDFiLzjcXSiTlh-vIzZ9sd0";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

// Role-based System Instructions
const SYSTEM_INSTRUCTIONS = {
  admin: {
    text: "Act as a formal Compliance Officer and Data Analyst for the EthioAgriConnect platform. Your primary duty is to analyze reports, flag regulatory violations, identify data inconsistencies, and summarize user feedback sentiment precisely. IMPORTANT: ONLY answer questions related to platform management, user data, compliance, analytics, and EthioAgriConnect operations. If asked about topics unrelated to platform administration (politics, general knowledge, entertainment, etc.), politely respond: 'I'm your EthioAgriConnect Admin Assistant. I can only help with platform management, analytics, and compliance questions. How can I assist with platform operations?'",
  },
  farmer: {
    text: "Act as a dedicated Sustainable Agriculture Consultant for EthioAgriConnect farmers. Provide actionable, practical advice on crop health, pest management, optimal schedules, and offer competitive pricing guidance to maximize profitability. Be helpful and professional. IMPORTANT: ONLY answer questions related to farming, agriculture, crops, livestock, pricing, market trends, and selling on EthioAgriConnect. If asked about topics unrelated to agriculture and farming (politics, general knowledge, entertainment, etc.), politely respond: 'I'm your EthioAgriConnect Farming Assistant. I can only help with questions about agriculture, crops, pricing, and selling your products. How can I assist with your farming business today?'",
  },
  consumer: {
    text: "Act as a friendly, knowledgeable Food Tracer and Discovery Assistant for EthioAgriConnect marketplace. Provide instant, accurate answers about product origin and ethical sourcing, and generate creative, relevant recipes based on the produce available. Your tone must be inviting and trustworthy. IMPORTANT: ONLY answer questions related to agricultural products, food, recipes, nutrition, cooking, product sourcing, and shopping on EthioAgriConnect. If asked about topics unrelated to food and agriculture (politics, general knowledge, entertainment, etc.), politely respond: 'I'm your EthioAgriConnect Food Assistant. I can only help with questions about products, recipes, nutrition, and shopping. What would you like to know about our agricultural products?'",
  },
  delivery_man: {
    text: "Act as a hyper-efficient Logistics and Compliance Manager for EthioAgriConnect delivery operations. Your primary duty is to provide real-time route adjustments, instantly retrieve specific cold-chain SOPs or drop-off rules, and assist with compliance logging by summarizing data points and flagging deviations. Your tone must be concise, accurate, and focused on maximizing delivery speed and compliance. Provide actionable answers for temperature control, handling procedures, route optimization, and regulatory compliance. IMPORTANT: ONLY answer questions related to delivery operations, logistics, product handling, routes, compliance, and agricultural product delivery. If asked about topics unrelated to delivery operations (politics, general knowledge, entertainment, etc.), politely respond: 'I'm your EthioAgriConnect Delivery Assistant. I can only help with delivery-related questions such as routes, handling procedures, compliance, and logistics. How can I assist with your delivery today?'",
  },
};

// Base function to call Gemini API
export interface GeminiRequest {
  text: string;
  role?: "admin" | "farmer" | "consumer" | "delivery_man";
  imageUrl?: string;
  enableSearch?: boolean;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Call Gemini API with role-based persona
 */
export async function callGeminiAPI(
  request: GeminiRequest
): Promise<GeminiResponse> {
  try {
    const role = request.role || "consumer";
    const systemInstruction = SYSTEM_INSTRUCTIONS[role];

    const payload: any = {
      contents: [
        {
          parts: [
            {
              text: request.text,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction.text,
          },
        ],
      },
    };

    // Add image if provided
    if (request.imageUrl) {
      let imageData = request.imageUrl;

      // Handle data URL (base64)
      if (imageData.startsWith("data:image")) {
        imageData = imageData.split(",")[1];
      } else if (
        imageData.startsWith("http://") ||
        imageData.startsWith("https://")
      ) {
        // For remote URLs, we need to fetch and convert to base64
        // For now, skip image analysis if it's a remote URL (could be enhanced later)
        // Gemini API supports file URLs but requires special handling
        console.warn(
          "Remote image URLs require additional configuration for Gemini API"
        );
        return {
          text: "",
          error: "Remote image URLs not yet supported for analysis",
        };
      }

      payload.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageData,
        },
      });
    }

    // Enable Google Search if requested
    if (request.enableSearch) {
      payload.tools = [
        {
          google_search: {},
        },
      ];
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts
        .map((part: any) => part.text || "")
        .join("\n");

      return { text };
    }

    return { text: "", error: "No response from API" };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      text: "",
      error: error.message || "Failed to call Gemini API",
    };
  }
}

/**
 * ADMIN FEATURES
 */

// Content Moderation
export async function moderateContent(
  content: string,
  contentType: "text" | "image"
): Promise<{
  isSafe: boolean;
  reason?: string;
  flaggedCategories?: string[];
}> {
  const prompt = `Analyze this ${contentType} for the EthioAgriConnect agricultural marketplace and determine if it violates community standards.

ONLY flag content that contains:
- Explicit inappropriate language or offensive content
- Clearly non-agricultural or completely unrelated content (e.g., electronics, weapons)
- Obvious scams or fraudulent listings (e.g., "send money first", "guaranteed returns")
- Intentionally misleading product information

DO NOT flag content for:
- Being brief or concise (farmers often write short descriptions)
- Missing minor details (quantity, origin can be added later)
- Simple product listings (e.g., "Fresh tomatoes from my farm")
- Legitimate agricultural products with basic information

Content to analyze: "${content}"

Be lenient and practical. Only flag serious violations. Respond in JSON format: {"isSafe": boolean, "reason": "string", "flaggedCategories": ["category1", "category2"]}`;

  const response = await callGeminiAPI({ text: prompt, role: "admin" });

  try {
    // Try to parse JSON from response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      // Additional check: if reason mentions "incomplete" or "deficiency", mark as safe
      if (result.reason && (
        result.reason.toLowerCase().includes('incomplete') ||
        result.reason.toLowerCase().includes('deficiency') ||
        result.reason.toLowerCase().includes('lacks') ||
        result.reason.toLowerCase().includes('brief')
      )) {
        return { isSafe: true, reason: result.reason, flaggedCategories: [] };
      }
      return result;
    }
  } catch (e) {
    console.error("Failed to parse moderation response:", e);
  }

  // Fallback: check if response suggests safety
  const lowerText = response.text.toLowerCase();
  const isSafe =
    !lowerText.includes("unsafe") &&
    !lowerText.includes("violation") &&
    !lowerText.includes("scam") &&
    !lowerText.includes("fraudulent");

  return { isSafe, reason: response.text };
}

// Sentiment Analysis for Reviews
export async function analyzeReviewSentiment(
  reviews: Array<{ comment: string; stars: number }>
): Promise<{
  overallSentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  keyTopics: Array<{ topic: string; sentiment: string; count: number }>;
  summary: string;
}> {
  const reviewsText = reviews
    .map((r, i) => `Review ${i + 1}: ${r.stars} stars - "${r.comment}"`)
    .join("\n");

  const prompt = `Analyze the sentiment of these user reviews from the EthioAgriConnect platform:

${reviewsText}

Provide a comprehensive sentiment analysis in JSON format:
{
  "overallSentiment": "positive|negative|neutral",
  "sentimentScore": 0-100,
  "keyTopics": [
    {"topic": "topic name", "sentiment": "positive|negative|neutral", "count": number}
  ],
  "summary": "brief summary of main concerns and positive points"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "admin",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse sentiment analysis:", e);
  }

  // Fallback
  const lowerText = response.text.toLowerCase();
  const overallSentiment = lowerText.includes("positive")
    ? "positive"
    : lowerText.includes("negative")
    ? "negative"
    : "neutral";

  return {
    overallSentiment,
    sentimentScore: 50,
    keyTopics: [],
    summary: response.text,
  };
}

// Pricing Strategy Analysis
export async function analyzePricingStrategy(
  productName: string,
  currentPrice: number,
  similarProducts: Array<{ name: string; price: number }>
): Promise<{
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  marketAverage: number;
  recommendation: string;
  reasoning: string;
}> {
  const similarProductsText = similarProducts
    .map((p) => `- ${p.name}: $${p.price}`)
    .join("\n");

  const prompt = `Analyze pricing strategy for "${productName}" currently priced at $${currentPrice}.

Similar products on the platform:
${similarProductsText}

Provide data-driven pricing recommendations in JSON format:
{
  "suggestedPrice": number,
  "priceRange": {"min": number, "max": number},
  "marketAverage": number,
  "recommendation": "pricing strategy recommendation",
  "reasoning": "explanation of the pricing analysis"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "admin",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse pricing analysis:", e);
  }

  // Fallback: calculate average
  const marketAverage =
    similarProducts.length > 0
      ? similarProducts.reduce((sum, p) => sum + p.price, 0) /
        similarProducts.length
      : currentPrice;

  return {
    suggestedPrice: marketAverage,
    priceRange: { min: marketAverage * 0.9, max: marketAverage * 1.1 },
    marketAverage,
    recommendation: "Price competitively based on market average",
    reasoning: response.text || "Analysis based on market data",
  };
}

/**
 * FARMER FEATURES
 */

// Generate Product Description
export async function generateProductDescription(
  productName: string,
  category: string,
  bulletPoints: string[]
): Promise<string> {
  const prompt = `Create an engaging, SEO-friendly product description for "${productName}" in the "${category}" category.

Key points to include:
${bulletPoints.map((p) => `- ${p}`).join("\n")}

Make the description:
- Professional and appealing
- Highlight unique qualities and freshness
- Mention sustainable farming practices if applicable
- Optimized for search but natural-sounding
- 3-4 sentences in length`;

  const response = await callGeminiAPI({ text: prompt, role: "farmer" });
  return (
    response.text ||
    `Fresh ${productName} from our sustainable farm. ${bulletPoints.join(
      ". "
    )}.`
  );
}

// Auto-categorize Product from Image/Text
export async function categorizeProduct(
  productName: string,
  description: string,
  imageUrl?: string
): Promise<{
  category: string;
  tags: string[];
  confidence: number;
}> {
  const prompt = `Categorize this product for an agricultural marketplace:

Name: "${productName}"
Description: "${description}"

Available categories: vegetables, fruits, grains, dairy, herbs, other

Respond in JSON format:
{
  "category": "one of the available categories",
  "tags": ["tag1", "tag2", "tag3"] (e.g., "Organic", "Heirloom", "Seasonal", "Local"),
  "confidence": 0-100
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    imageUrl: imageUrl,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse categorization:", e);
  }

  // Fallback
  const categories = [
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "herbs",
    "other",
  ];
  const lowerName = productName.toLowerCase();
  let category = "other";

  if (
    lowerName.includes("tomato") ||
    lowerName.includes("carrot") ||
    lowerName.includes("lettuce")
  ) {
    category = "vegetables";
  } else if (
    lowerName.includes("apple") ||
    lowerName.includes("berry") ||
    lowerName.includes("mango")
  ) {
    category = "fruits";
  }

  return {
    category,
    tags: ["Local", "Fresh"],
    confidence: 70,
  };
}

// Get Pricing Guidance for Farmer
export async function getPricingGuidance(
  productName: string,
  currentPrice: number,
  marketData?: Array<{ name: string; price: number }>
): Promise<{
  suggestedPrice: number;
  isCompetitive: boolean;
  recommendation: string;
  marketInsights: string;
}> {
  const marketDataText =
    marketData && marketData.length > 0
      ? `Current market prices:\n${marketData
          .map((p) => `- ${p.name}: $${p.price}`)
          .join("\n")}`
      : "Limited market data available";

  const prompt = `As a Sustainable Agriculture Consultant, provide pricing guidance for "${productName}" currently priced at $${currentPrice}.

${marketDataText}

Provide competitive pricing recommendations in JSON format:
{
  "suggestedPrice": number,
  "isCompetitive": boolean,
  "recommendation": "specific pricing advice",
  "marketInsights": "market trends and insights"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse pricing guidance:", e);
  }

  // Fallback
  const marketAvg =
    marketData && marketData.length > 0
      ? marketData.reduce((sum, p) => sum + p.price, 0) / marketData.length
      : currentPrice;

  return {
    suggestedPrice: marketAvg,
    isCompetitive: Math.abs(currentPrice - marketAvg) / marketAvg < 0.2,
    recommendation: "Consider pricing within 10-20% of market average",
    marketInsights: response.text || "Market analysis based on available data",
  };
}

/**
 * CONSUMER FEATURES
 */

// Get Recipe Suggestions
export async function getRecipeSuggestion(
  productName: string,
  additionalProducts?: string[]
): Promise<{
  recipe: {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    difficulty: string;
  };
}> {
  const additional =
    additionalProducts && additionalProducts.length > 0
      ? ` You may also use: ${additionalProducts.join(", ")}.`
      : "";

  const prompt = `As a Food Tracer and Discovery Assistant, suggest a quick, healthy recipe using ${productName}.${additional}

Provide the recipe in JSON format:
{
  "recipe": {
    "title": "recipe name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "prepTime": "time estimate",
    "difficulty": "easy|medium|hard"
  }
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "consumer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse recipe:", e);
  }

  // Fallback
  return {
    recipe: {
      title: `Simple ${productName} Recipe`,
      ingredients: [productName, "Salt", "Pepper", "Olive Oil"],
      instructions: [
        `Wash and prepare ${productName}`,
        "Season with salt and pepper",
        "Cook according to your preference",
        "Serve hot",
      ],
      prepTime: "15 minutes",
      difficulty: "easy",
    },
  };
}

// Get Product Information and Nutritional Facts
export async function getProductInfo(productName: string): Promise<{
  origin: string;
  nutritionalFacts: Record<string, string>;
  storageTips: string[];
  cookingTips: string[];
  description: string;
}> {
  const prompt = `As a Food Tracer and Discovery Assistant, provide comprehensive information about ${productName}:
- Origin and typical growing regions
- Key nutritional facts
- Storage tips
- Cooking/preparation tips
- Brief description

Respond in JSON format:
{
  "origin": "typical origin information",
  "nutritionalFacts": {"key": "value"},
  "storageTips": ["tip1", "tip2"],
  "cookingTips": ["tip1", "tip2"],
  "description": "brief description"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "consumer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse product info:", e);
  }

  // Fallback
  return {
    origin: "Locally sourced",
    nutritionalFacts: {
      "Rich in": "Vitamins and minerals",
      Fiber: "High",
    },
    storageTips: ["Store in a cool, dry place", "Refrigerate if needed"],
    cookingTips: ["Wash thoroughly before use", "Best when fresh"],
    description: `Fresh ${productName} sourced locally.`,
  };
}

// Enhanced Search Query Understanding
export async function enhanceSearchQuery(
  query: string,
  availableProducts: Array<{
    name: string;
    description: string;
    category: string;
  }>
): Promise<{
  improvedQuery: string;
  searchTerms: string[];
  suggestedCategories: string[];
  matchedProducts: Array<{ name: string; matchScore: number; reason: string }>;
}> {
  const productsList = availableProducts
    .map((p) => `- ${p.name} (${p.category}): ${p.description}`)
    .join("\n");

  const prompt = `Analyze this search query for an agricultural marketplace: "${query}"

Available products:
${productsList}

Understand the user's intent and improve the search. Respond in JSON format:
{
  "improvedQuery": "better search query",
  "searchTerms": ["term1", "term2"],
  "suggestedCategories": ["category1"],
  "matchedProducts": [
    {"name": "product name", "matchScore": 0-100, "reason": "why it matches"}
  ]
}`;

  const response = await callGeminiAPI({ text: prompt, role: "consumer" });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse enhanced search:", e);
  }

  // Fallback: simple keyword matching
  const searchTerms = query.toLowerCase().split(" ");
  const matchedProducts = availableProducts
    .map((p) => {
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      const matchScore =
        searchTerms.filter((term) => text.includes(term)).length * 33;
      return {
        name: p.name,
        matchScore: Math.min(matchScore, 100),
        reason: "Keyword match",
      };
    })
    .filter((p) => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return {
    improvedQuery: query,
    searchTerms,
    suggestedCategories: [],
    matchedProducts,
  };
}

// AI Chatbot Assistant
export async function chatWithAssistant(
  message: string,
  context?: { productName?: string; role?: "farmer" | "consumer" }
): Promise<string> {
  const contextText = context?.productName
    ? `Context: User is asking about "${context.productName}"`
    : "";

  const prompt = contextText
    ? `${contextText}\n\nUser message: ${message}`
    : message;

  const role = context?.role || "consumer";
  const response = await callGeminiAPI({
    text: prompt,
    role,
    enableSearch: true,
  });
  return (
    response.text ||
    "I'm sorry, I couldn't process that request. Please try again."
  );
}


/**
 * DELIVERY MAN FEATURES
 */

// Cold-Chain Compliance Check
export async function checkColdChainCompliance(
  productType: string,
  currentTemperature: number,
  duration: number
): Promise<{
  isCompliant: boolean;
  maxTemperature: number;
  minTemperature: number;
  recommendation: string;
  action: "accept" | "reject" | "monitor";
  reasoning: string;
}> {
  const prompt = `I am picking up ${productType}. The current refrigerated unit temperature is ${currentTemperature}°C and has been at this temperature for ${duration} minutes.

What is the maximum acceptable temperature deviation? Should I accept or reject this load?

Respond in JSON format:
{
  "isCompliant": boolean,
  "maxTemperature": number,
  "minTemperature": number,
  "recommendation": "specific action to take",
  "action": "accept|reject|monitor",
  "reasoning": "explanation based on cold-chain standards"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse cold-chain compliance:", e);
  }

  // Fallback
  return {
    isCompliant: currentTemperature <= 4,
    maxTemperature: 4,
    minTemperature: 0,
    recommendation: response.text || "Maintain temperature below 4°C",
    action: currentTemperature <= 4 ? "accept" : "reject",
    reasoning: "Standard cold-chain requirements for perishable goods",
  };
}

// Route Optimization Suggestions
export async function getRouteOptimization(
  pickupAddress: string,
  deliveryAddress: string,
  currentLocation?: string,
  trafficConditions?: string
): Promise<{
  estimatedTime: string;
  distance: string;
  routeSuggestion: string;
  alternativeRoutes: Array<{ route: string; time: string; notes: string }>;
  warnings: string[];
}> {
  const locationContext = currentLocation
    ? `Current location: ${currentLocation}`
    : "";
  const trafficContext = trafficConditions
    ? `Traffic conditions: ${trafficConditions}`
    : "";

  const prompt = `Provide route optimization for delivery:
Pickup: ${pickupAddress}
Delivery: ${deliveryAddress}
${locationContext}
${trafficContext}

Respond in JSON format:
{
  "estimatedTime": "time estimate",
  "distance": "distance estimate",
  "routeSuggestion": "recommended route",
  "alternativeRoutes": [
    {"route": "route description", "time": "time estimate", "notes": "additional info"}
  ],
  "warnings": ["warning1", "warning2"]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse route optimization:", e);
  }

  // Fallback
  return {
    estimatedTime: "30-45 minutes",
    distance: "15 km",
    routeSuggestion: response.text || "Use fastest route available",
    alternativeRoutes: [],
    warnings: ["Check traffic conditions before departure"],
  };
}

// Handling Instructions for Product Type
export async function getHandlingInstructions(
  productType: string,
  quantity: number,
  specialNotes?: string
): Promise<{
  handlingSteps: string[];
  packagingRequirements: string[];
  temperatureRequirements: string;
  safetyPrecautions: string[];
  estimatedHandlingTime: string;
}> {
  const notesContext = specialNotes ? `Special notes: ${specialNotes}` : "";

  const prompt = `Provide handling instructions for delivery of ${quantity} kg of ${productType}.
${notesContext}

Respond in JSON format:
{
  "handlingSteps": ["step1", "step2"],
  "packagingRequirements": ["requirement1", "requirement2"],
  "temperatureRequirements": "temperature info",
  "safetyPrecautions": ["precaution1", "precaution2"],
  "estimatedHandlingTime": "time estimate"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse handling instructions:", e);
  }

  // Fallback
  return {
    handlingSteps: [
      "Inspect product condition",
      "Verify quantity",
      "Load carefully to prevent damage",
      "Secure items during transport",
    ],
    packagingRequirements: ["Use appropriate containers", "Ensure proper sealing"],
    temperatureRequirements: "Keep refrigerated if perishable",
    safetyPrecautions: ["Wear gloves if needed", "Handle with care"],
    estimatedHandlingTime: "5-10 minutes",
  };
}

// Delivery Issue Resolution
export async function resolveDeliveryIssue(
  issueType: string,
  issueDescription: string,
  deliveryDetails: {
    productName: string;
    customerName: string;
    address: string;
  }
): Promise<{
  solution: string;
  steps: string[];
  escalate: boolean;
  contactInfo: string;
  documentation: string[];
}> {
  const prompt = `Delivery issue encountered:
Issue Type: ${issueType}
Description: ${issueDescription}
Product: ${deliveryDetails.productName}
Customer: ${deliveryDetails.customerName}
Address: ${deliveryDetails.address}

Provide immediate resolution steps in JSON format:
{
  "solution": "recommended solution",
  "steps": ["step1", "step2"],
  "escalate": boolean (if issue needs escalation),
  "contactInfo": "who to contact if needed",
  "documentation": ["what to document"]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse issue resolution:", e);
  }

  // Fallback
  return {
    solution: response.text || "Contact support for assistance",
    steps: [
      "Document the issue with photos",
      "Contact customer to explain situation",
      "Report to dispatch/support",
    ],
    escalate: true,
    contactInfo: "Contact EthioAgriConnect support",
    documentation: ["Take photos", "Record time and location", "Get customer signature if possible"],
  };
}

// Compliance Logging Assistant
export async function generateComplianceLog(
  deliveryData: {
    orderId: string;
    productName: string;
    pickupTime: string;
    deliveryTime: string;
    temperature?: number;
    issues?: string[];
  }
): Promise<{
  logSummary: string;
  flaggedItems: Array<{ item: string; severity: "low" | "medium" | "high"; reason: string }>;
  complianceScore: number;
  recommendations: string[];
}> {
  const issuesText = deliveryData.issues && deliveryData.issues.length > 0
    ? `Issues encountered: ${deliveryData.issues.join(", ")}`
    : "No issues reported";

  const tempText = deliveryData.temperature
    ? `Temperature maintained: ${deliveryData.temperature}°C`
    : "";

  const prompt = `Generate compliance log summary for delivery:
Order ID: ${deliveryData.orderId}
Product: ${deliveryData.productName}
Pickup Time: ${deliveryData.pickupTime}
Delivery Time: ${deliveryData.deliveryTime}
${tempText}
${issuesText}

Analyze compliance and respond in JSON format:
{
  "logSummary": "brief summary",
  "flaggedItems": [
    {"item": "item description", "severity": "low|medium|high", "reason": "why flagged"}
  ],
  "complianceScore": 0-100,
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse compliance log:", e);
  }

  // Fallback
  return {
    logSummary: `Delivery completed for order ${deliveryData.orderId}`,
    flaggedItems: [],
    complianceScore: 95,
    recommendations: ["Continue following standard procedures"],
  };
}

// Quick SOP Retrieval
export async function getSOPInstructions(
  topic: string
): Promise<{
  title: string;
  steps: string[];
  keyPoints: string[];
  references: string[];
}> {
  const prompt = `Provide Standard Operating Procedure (SOP) for: ${topic}

This is for agricultural product delivery. Be specific and actionable.

Respond in JSON format:
{
  "title": "SOP title",
  "steps": ["step1", "step2"],
  "keyPoints": ["key point 1", "key point 2"],
  "references": ["reference1", "reference2"]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse SOP:", e);
  }

  // Fallback
  return {
    title: `SOP: ${topic}`,
    steps: ["Follow standard procedures", "Document all actions", "Report any deviations"],
    keyPoints: ["Safety first", "Maintain quality", "Ensure compliance"],
    references: ["EthioAgriConnect Delivery Guidelines"],
  };
}

// AI Chatbot for Delivery Personnel
export async function chatWithDeliveryAssistant(
  message: string,
  context?: {
    orderId?: string;
    productName?: string;
    currentStatus?: string;
  }
): Promise<string> {
  const contextText = context
    ? `Context: ${context.orderId ? `Order ID: ${context.orderId}` : ""} ${
        context.productName ? `Product: ${context.productName}` : ""
      } ${context.currentStatus ? `Status: ${context.currentStatus}` : ""}`
    : "";

  const prompt = contextText
    ? `${contextText}\n\nDelivery personnel question: ${message}`
    : message;

  const response = await callGeminiAPI({
    text: prompt,
    role: "delivery_man",
    enableSearch: true,
  });

  return (
    response.text ||
    "I'm here to help with logistics and compliance. Please provide more details about your question."
  );
}

/**
 * ADVANCED FARMER FEATURES
 */

// Predict Product Demand
export async function predictProductDemand(
  productName: string,
  category: string,
  historicalSales?: Array<{ date: string; quantity: number; revenue: number }>,
  currentStock?: number
): Promise<{
  demandLevel: "low" | "medium" | "high" | "very high";
  predictedSales: number;
  recommendation: string;
  confidence: number;
  reasoning: string;
}> {
  const salesData = historicalSales && historicalSales.length > 0
    ? `Historical sales:\n${historicalSales.map(s => `- ${s.date}: ${s.quantity} units, $${s.revenue}`).join('\n')}`
    : "Limited historical data available";

  const stockInfo = currentStock !== undefined ? `Current stock: ${currentStock} units` : "";

  const prompt = `Analyze demand for "${productName}" in the "${category}" category.

${salesData}
${stockInfo}

Consider:
- Seasonal trends for this product
- Current market demand
- Historical patterns
- Category popularity

Respond in JSON format:
{
  "demandLevel": "low|medium|high|very high",
  "predictedSales": number (units expected in next 7 days),
  "recommendation": "specific action to take",
  "confidence": 0-100,
  "reasoning": "explanation of prediction"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse demand prediction:", e);
  }

  // Fallback
  return {
    demandLevel: "medium",
    predictedSales: currentStock ? Math.floor(currentStock * 0.3) : 10,
    recommendation: "Maintain current stock levels",
    confidence: 60,
    reasoning: response.text || "Based on category trends and market analysis",
  };
}

// Generate Inventory Alerts
export async function generateInventoryAlerts(
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    category: string;
    pricePerUnit: number;
    recentSales?: number;
  }>
): Promise<Array<{
  productId: string;
  productName: string;
  alertType: "low_stock" | "overstock" | "price_adjustment" | "high_demand";
  severity: "low" | "medium" | "high";
  message: string;
  action: string;
}>> {
  const productsText = products.map(p => 
    `- ${p.name}: ${p.quantity} units at $${p.pricePerUnit} (${p.category})${p.recentSales ? `, ${p.recentSales} recent sales` : ''}`
  ).join('\n');

  const prompt = `Analyze this farmer's inventory and generate actionable alerts:

${productsText}

Identify:
- Low stock items that need restocking
- Overstocked items that should be promoted
- Pricing opportunities (too high/low)
- High demand products to prioritize

Respond in JSON format:
{
  "alerts": [
    {
      "productId": "id",
      "productName": "name",
      "alertType": "low_stock|overstock|price_adjustment|high_demand",
      "severity": "low|medium|high",
      "message": "alert message",
      "action": "recommended action"
    }
  ]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.alerts || [];
    }
  } catch (e) {
    console.error("Failed to parse inventory alerts:", e);
  }

  // Fallback: generate basic alerts
  const alerts: Array<any> = [];
  products.forEach(p => {
    if (p.quantity < 10) {
      alerts.push({
        productId: p.id,
        productName: p.name,
        alertType: "low_stock",
        severity: "high",
        message: `${p.name} stock is running low (${p.quantity} units left)`,
        action: "Restock soon to avoid stockouts",
      });
    }
  });

  return alerts;
}

// Optimize Product Listing
export async function optimizeProductListing(
  product: {
    name: string;
    description: string;
    category: string;
    pricePerUnit: number;
    imageUrl?: string;
    likes?: number;
    views?: number;
  }
): Promise<{
  score: number;
  suggestions: Array<{
    category: string;
    priority: "low" | "medium" | "high";
    suggestion: string;
    impact: string;
  }>;
  summary: string;
}> {
  const prompt = `Analyze this product listing and provide optimization suggestions:

Name: ${product.name}
Description: ${product.description}
Category: ${product.category}
Price: $${product.pricePerUnit}
${product.likes ? `Likes: ${product.likes}` : ''}
${product.views ? `Views: ${product.views}` : ''}
${product.imageUrl ? 'Has image: Yes' : 'Has image: No'}

Evaluate:
- Description quality and SEO
- Pricing competitiveness
- Image quality/presence
- Title effectiveness
- Overall listing appeal

Respond in JSON format:
{
  "score": 0-100,
  "suggestions": [
    {
      "category": "description|pricing|images|title|other",
      "priority": "low|medium|high",
      "suggestion": "specific improvement",
      "impact": "expected benefit"
    }
  ],
  "summary": "overall assessment"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse optimization:", e);
  }

  // Fallback
  const suggestions: Array<any> = [];
  
  if (!product.imageUrl) {
    suggestions.push({
      category: "images",
      priority: "high",
      suggestion: "Add a high-quality product image",
      impact: "Images increase sales by 30-40%",
    });
  }

  if (product.description.length < 50) {
    suggestions.push({
      category: "description",
      priority: "medium",
      suggestion: "Expand product description with more details",
      impact: "Better descriptions improve conversion by 20%",
    });
  }

  return {
    score: 70,
    suggestions,
    summary: response.text || "Good listing with room for improvement",
  };
}

// Forecast Revenue
export async function forecastRevenue(
  farmerId: string,
  products: Array<{
    name: string;
    pricePerUnit: number;
    quantity: number;
    category: string;
  }>,
  historicalRevenue?: Array<{ month: string; revenue: number }>,
  timeframe: "week" | "month" | "quarter" = "month"
): Promise<{
  predictedRevenue: number;
  confidence: number;
  breakdown: Array<{ category: string; expectedRevenue: number }>;
  insights: string[];
  recommendations: string[];
}> {
  const productsText = products.map(p => 
    `- ${p.name} (${p.category}): ${p.quantity} units at $${p.pricePerUnit}`
  ).join('\n');

  const historyText = historicalRevenue && historicalRevenue.length > 0
    ? `Historical revenue:\n${historicalRevenue.map(h => `- ${h.month}: $${h.revenue}`).join('\n')}`
    : "Limited historical data";

  const prompt = `Forecast revenue for the next ${timeframe} for this farmer:

Current Products:
${productsText}

${historyText}

Consider:
- Seasonal trends
- Product mix
- Market conditions
- Historical patterns

Respond in JSON format:
{
  "predictedRevenue": number,
  "confidence": 0-100,
  "breakdown": [
    {"category": "category name", "expectedRevenue": number}
  ],
  "insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse revenue forecast:", e);
  }

  // Fallback: simple calculation
  const totalValue = products.reduce((sum, p) => sum + (p.pricePerUnit * p.quantity * 0.3), 0);
  
  return {
    predictedRevenue: Math.round(totalValue),
    confidence: 65,
    breakdown: [],
    insights: ["Based on current inventory and market trends"],
    recommendations: ["Maintain diverse product mix", "Monitor seasonal demand"],
  };
}

// Analyze Customer Behavior
export async function analyzeCustomerBehavior(
  farmerId: string,
  orders: Array<{
    customerId: string;
    customerName: string;
    products: string[];
    totalAmount: number;
    date: string;
  }>
): Promise<{
  topCustomers: Array<{ name: string; totalSpent: number; orderCount: number }>;
  purchasePatterns: Array<{ pattern: string; frequency: number }>;
  recommendations: string[];
  retentionRisk: Array<{ customerName: string; reason: string; action: string }>;
}> {
  const ordersText = orders.slice(0, 20).map(o => 
    `- ${o.customerName}: ${o.products.join(', ')} - $${o.totalAmount} (${o.date})`
  ).join('\n');

  const prompt = `Analyze customer behavior for this farmer:

Recent Orders:
${ordersText}

Identify:
- Top customers by spending
- Common purchase patterns
- Cross-sell opportunities
- Customers at risk of churning
- Retention strategies

Respond in JSON format:
{
  "topCustomers": [
    {"name": "customer name", "totalSpent": number, "orderCount": number}
  ],
  "purchasePatterns": [
    {"pattern": "pattern description", "frequency": number}
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "retentionRisk": [
    {"customerName": "name", "reason": "why at risk", "action": "what to do"}
  ]
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse customer analysis:", e);
  }

  // Fallback: basic analysis
  const customerMap = new Map<string, { name: string; spent: number; count: number }>();
  
  orders.forEach(o => {
    const existing = customerMap.get(o.customerId) || { name: o.customerName, spent: 0, count: 0 };
    existing.spent += o.totalAmount;
    existing.count += 1;
    customerMap.set(o.customerId, existing);
  });

  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .map(c => ({ name: c.name, totalSpent: c.spent, orderCount: c.count }));

  return {
    topCustomers,
    purchasePatterns: [],
    recommendations: ["Offer loyalty rewards to top customers", "Send personalized product recommendations"],
    retentionRisk: [],
  };
}

// Generate Marketing Content
export async function generateMarketingContent(
  product: {
    name: string;
    description: string;
    category: string;
    pricePerUnit: number;
  },
  platform: "social_media" | "email" | "promotional",
  tone: "casual" | "professional" | "enthusiastic" = "casual"
): Promise<{
  content: string;
  hashtags?: string[];
  callToAction: string;
  bestTimeToPost?: string;
}> {
  const prompt = `Create ${platform} marketing content for this product:

Product: ${product.name}
Description: ${product.description}
Category: ${product.category}
Price: $${product.pricePerUnit}

Tone: ${tone}
Platform: ${platform}

Create engaging content that:
- Highlights product benefits
- Appeals to target audience
- Includes call-to-action
- Uses appropriate hashtags (if social media)

Respond in JSON format:
{
  "content": "marketing text",
  "hashtags": ["tag1", "tag2"] (if applicable),
  "callToAction": "CTA text",
  "bestTimeToPost": "timing suggestion"
}`;

  const response = await callGeminiAPI({
    text: prompt,
    role: "farmer",
    enableSearch: true,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse marketing content:", e);
  }

  // Fallback
  return {
    content: `Fresh ${product.name} now available! ${product.description} Get yours today for just $${product.pricePerUnit}!`,
    hashtags: ["#FreshProduce", "#LocalFarm", "#Organic", `#${product.category}`],
    callToAction: "Order now on EthioAgriConnect!",
    bestTimeToPost: "Morning (8-10 AM) or Evening (6-8 PM)",
  };
}
