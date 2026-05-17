import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import {
  chatWithAssistant,
  getRecipeSuggestion,
  getProductInfo,
} from "../lib/gemini";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  productName?: string;
}

const AIChatbot = ({ productName }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      const greeting = productName
        ? `Hello! I'm your EthioAgriConnect AI assistant. How can I help you with ${productName} today? I can provide recipes, nutritional info, cooking tips, or answer questions about products!`
        : `Hello! I'm your EthioAgriConnect AI assistant. I can help you with recipes, product information, nutritional facts, and answer questions about agricultural products. How can I assist you today?`;

      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, productName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (overrideMessage?: string) => {
    const messageText = (overrideMessage ?? input).trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Check for specific intents
      const lowerInput = messageText.toLowerCase();

      let response = "";

      if (lowerInput.includes("recipe") && productName) {
        const recipeData = await getRecipeSuggestion(productName);
        response = `**${
          recipeData.recipe.title
        }**\n\n**Ingredients:**\n${recipeData.recipe.ingredients
          .map((i) => `- ${i}`)
          .join("\n")}\n\n**Instructions:**\n${recipeData.recipe.instructions
          .map((step, i) => `${i + 1}. ${step}`)
          .join("\n")}\n\n**Prep Time:** ${
          recipeData.recipe.prepTime
        }\n**Difficulty:** ${recipeData.recipe.difficulty}`;
      } else if (
        (lowerInput.includes("nutrition") ||
          lowerInput.includes("nutritious") ||
          lowerInput.includes("healthy")) &&
        productName
      ) {
        const productInfo = await getProductInfo(productName);
        response = `**Nutritional Information for ${productName}:**\n\n**Origin:** ${
          productInfo.origin
        }\n\n**Nutritional Facts:**\n${Object.entries(
          productInfo.nutritionalFacts
        )
          .map(([key, value]) => `- **${key}**: ${value}`)
          .join("\n")}\n\n**Storage Tips:**\n${productInfo.storageTips
          .map((tip) => `- ${tip}`)
          .join("\n")}\n\n**Cooking Tips:**\n${productInfo.cookingTips
          .map((tip) => `- ${tip}`)
          .join("\n")}\n\n${productInfo.description}`;
      } else {
        // General chat
        response = await chatWithAssistant(messageText, {
          productName,
          role: userData?.role === "farmer" ? "farmer" : "consumer",
        });
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please try rephrasing your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: "Recipe Suggestions",
      query: productName
        ? `Give me a recipe using ${productName}`
        : "Show me recipe ideas",
    },
    {
      label: "Nutritional Info",
      query: productName
        ? `Tell me about ${productName} nutrition`
        : "Nutritional information",
    },
    {
      label: "Cooking Tips",
      query: productName ? `How to cook ${productName}?` : "Cooking tips",
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition z-50"
        aria-label="Open AI Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-green-100">
            {productName
              ? `Helping with ${productName}`
              : "Your food & farming guide"}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-green-700 rounded-full p-1 transition"
          aria-label="Close chatbot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-900 shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-green-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pt-2 pb-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSend(action.query)}
                className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about products, recipes, nutrition..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
