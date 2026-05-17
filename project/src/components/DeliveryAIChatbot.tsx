import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Thermometer, Route, Package, AlertTriangle, FileText } from 'lucide-react';
import { chatWithDeliveryAssistant, checkColdChainCompliance, getRouteOptimization, getHandlingInstructions, resolveDeliveryIssue, getSOPInstructions } from '../lib/gemini';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'compliance' | 'route' | 'handling' | 'issue' | 'sop';
  data?: any;
}

interface DeliveryAIChatbotProps {
  deliveryContext?: {
    orderId?: string;
    productName?: string;
    currentStatus?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
  };
}

const DeliveryAIChatbot = ({ deliveryContext }: DeliveryAIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Logistics and Compliance Assistant. I can help you with:\n\n🌡️ Cold-chain compliance checks\n🗺️ Route optimization\n📦 Handling instructions\n⚠️ Issue resolution\n📋 SOP retrieval\n\nHow can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'ai', type?: string, data?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type: type as any,
      data,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    addMessage(action, 'user');

    try {
      if (action.includes('cold-chain') || action.includes('temperature')) {
        const productType = deliveryContext?.productName || 'perishable goods';
        const result = await checkColdChainCompliance(productType, 3, 30);
        
        const responseText = `**Cold-Chain Compliance Check**\n\n` +
          `Product: ${productType}\n` +
          `Status: ${result.isCompliant ? '✅ Compliant' : '❌ Non-Compliant'}\n` +
          `Temperature Range: ${result.minTemperature}°C - ${result.maxTemperature}°C\n` +
          `Action: ${result.action.toUpperCase()}\n\n` +
          `**Recommendation:** ${result.recommendation}\n\n` +
          `**Reasoning:** ${result.reasoning}`;
        
        addMessage(responseText, 'ai', 'compliance', result);
      } else if (action.includes('route') || action.includes('optimization')) {
        if (!deliveryContext?.pickupAddress || !deliveryContext?.deliveryAddress) {
          addMessage('Please provide pickup and delivery addresses for route optimization.', 'ai');
        } else {
          const result = await getRouteOptimization(
            deliveryContext.pickupAddress,
            deliveryContext.deliveryAddress
          );
          
          const responseText = `**Route Optimization**\n\n` +
            `📍 Distance: ${result.distance}\n` +
            `⏱️ Estimated Time: ${result.estimatedTime}\n\n` +
            `**Recommended Route:**\n${result.routeSuggestion}\n\n` +
            (result.warnings.length > 0 ? `⚠️ **Warnings:**\n${result.warnings.map(w => `• ${w}`).join('\n')}` : '');
          
          addMessage(responseText, 'ai', 'route', result);
        }
      } else if (action.includes('handling') || action.includes('instructions')) {
        const productType = deliveryContext?.productName || 'agricultural products';
        const result = await getHandlingInstructions(productType, 10);
        
        const responseText = `**Handling Instructions: ${productType}**\n\n` +
          `⏱️ Estimated Time: ${result.estimatedHandlingTime}\n` +
          `🌡️ Temperature: ${result.temperatureRequirements}\n\n` +
          `**Steps:**\n${result.handlingSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
          `**Safety Precautions:**\n${result.safetyPrecautions.map(p => `• ${p}`).join('\n')}`;
        
        addMessage(responseText, 'ai', 'handling', result);
      } else if (action.includes('SOP') || action.includes('procedure')) {
        const result = await getSOPInstructions('delivery procedures');
        
        const responseText = `**${result.title}**\n\n` +
          `**Steps:**\n${result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
          `**Key Points:**\n${result.keyPoints.map(k => `• ${k}`).join('\n')}`;
        
        addMessage(responseText, 'ai', 'sop', result);
      }
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Failed to process request');
      addMessage('Sorry, I encountered an error processing that request. Please try again.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const response = await chatWithDeliveryAssistant(userMessage, deliveryContext);
      addMessage(response, 'ai');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      addMessage('Sorry, I couldn\'t process your message. Please try again.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition z-50 flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-bold">Logistics AI Assistant</h3>
            <p className="text-xs text-green-100">Compliance & Route Optimization</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-green-800 p-1 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction('Check cold-chain compliance')}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition flex items-center gap-1 disabled:opacity-50"
          >
            <Thermometer className="w-3 h-3" />
            Temperature
          </button>
          <button
            onClick={() => handleQuickAction('Optimize route')}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition flex items-center gap-1 disabled:opacity-50"
          >
            <Route className="w-3 h-3" />
            Route
          </button>
          <button
            onClick={() => handleQuickAction('Get handling instructions')}
            disabled={isLoading}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200 transition flex items-center gap-1 disabled:opacity-50"
          >
            <Package className="w-3 h-3" />
            Handling
          </button>
          <button
            onClick={() => handleQuickAction('View SOP')}
            disabled={isLoading}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition flex items-center gap-1 disabled:opacity-50"
          >
            <FileText className="w-3 h-3" />
            SOP
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about compliance, routes, SOPs..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAIChatbot;
