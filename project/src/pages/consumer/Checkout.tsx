import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { calculatePaymentBreakdown, generateTransactionId, DEFAULT_DELIVERY_FEE } from '../../lib/payment';
import { PaymentMethod } from '../../types/payment';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';
import PaymentBreakdownCard from '../../components/PaymentBreakdownCard';
import { MapPin, ShoppingCart } from 'lucide-react';

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price?: number;
  pricePerUnit?: number;
  quantity: number;
  farmerId: string;
  farmerName: string;
  imageUrl?: string;
}

const Checkout = () => {
  const { userData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    phone: '',
  });

  // Calculate totals
  const productAmount = cartItems.reduce((sum, item) => {
    const itemPrice = item.pricePerUnit || item.price || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const breakdown = calculatePaymentBreakdown(productAmount, DEFAULT_DELIVERY_FEE);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone) {
      toast.error('Please fill in all delivery details');
      return;
    }

    const consumerId = userData?.uid || currentUser?.uid;
    if (!consumerId) {
      toast.error('You must be logged in to place an order');
      return;
    }

    setLoading(true);

    try {
      const batch = writeBatch(db);

      // Group items by farmer
      const ordersByFarmer = cartItems.reduce((acc, item) => {
        if (!acc[item.farmerId]) {
          acc[item.farmerId] = [];
        }
        acc[item.farmerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create orders for each farmer
      for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
        const farmerProductAmount = items.reduce((sum, item) => {
          const itemPrice = item.pricePerUnit || item.price || 0;
          return sum + (itemPrice * item.quantity);
        }, 0);
        const farmerBreakdown = calculatePaymentBreakdown(farmerProductAmount, DEFAULT_DELIVERY_FEE);
        const orderRef = doc(collection(db, 'orders'));
        const transactionId = generateTransactionId();

        // Create order
        batch.set(orderRef, {
          consumerId,
          consumerName: userData?.name || currentUser?.email || 'Consumer',
          farmerId,
          farmerName: items[0].farmerName,
          items: items.map(item => {
            const itemPrice = item.pricePerUnit || item.price || 0;
            return {
              productId: item.productId || item.id,
              productName: item.name,
              quantity: item.quantity,
              pricePerUnit: itemPrice,
              total: itemPrice * item.quantity,
            };
          }),
          deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}`,
          deliveryPhone: deliveryAddress.phone,
          status: 'pending',
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
          productAmount: farmerProductAmount,
          deliveryFee: DEFAULT_DELIVERY_FEE,
          totalAmount: farmerBreakdown.totalAmount,
          adminTax: farmerBreakdown.adminTax,
          farmerPayout: farmerBreakdown.farmerPayout,
          deliveryPayout: farmerBreakdown.deliveryPayout,
          deliveryPlatformFee: farmerBreakdown.deliveryPlatformFee,
          farmerPayoutStatus: 'pending',
          deliveryPayoutStatus: 'pending',
          transactionId,
          createdAt: Timestamp.now(),
          ...(paymentMethod === 'mobile_money' ? { paymentProvider: 'Telebirr' } : {}),
          ...(paymentMethod !== 'cod' ? { paidAt: Timestamp.now() } : {}),
        });
      }

      await batch.commit();

      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      
      toast.success('Order placed successfully!');
      navigate('/consumer/orders');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Browse Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">by {item.farmerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${((item.pricePerUnit || item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ${(item.pricePerUnit || item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Addis Ababa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) =>
                      setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+251 912 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <PaymentMethodSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PaymentBreakdownCard
                productAmount={breakdown.productAmount}
                deliveryFee={breakdown.deliveryFee}
                adminTax={breakdown.adminTax}
                showDetails={true}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
