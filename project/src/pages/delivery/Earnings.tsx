import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatCurrency } from '../../lib/payment';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import EarningsCard from '../../components/EarningsCard';
import PayoutRequestModal, { PayoutRequestData } from '../../components/PayoutRequestModal';
import { Truck, DollarSign, Banknote, CheckCircle } from 'lucide-react';

interface DeliveryEarnings {
  totalDeliveries: number;
  deliveryFeesEarned: number;
  platformFee: number;
  codCashCollected: number;
  pendingPayout: number;
  availableToWithdraw: number;
}

const DeliveryEarnings = () => {
  const { userData, currentUser } = useAuth();
  const [earnings, setEarnings] = useState<DeliveryEarnings>({
    totalDeliveries: 0,
    deliveryFeesEarned: 0,
    platformFee: 0,
    codCashCollected: 0,
    pendingPayout: 0,
    availableToWithdraw: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [currentUser?.uid, userData?.uid]);

  const fetchEarnings = async () => {
    const userId = userData?.uid || currentUser?.uid;

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all deliveries for this delivery man
      const deliveriesQuery = query(
        collection(db, 'deliveries'),
        where('deliveryManId', '==', userId)
      );
      const deliveriesSnapshot = await getDocs(deliveriesQuery);

      let totalDeliveries = 0;
      let deliveryFeesEarned = 0;
      let platformFee = 0;
      let codCashCollected = 0;

      deliveriesSnapshot.docs.forEach((doc) => {
        const delivery = doc.data();
        if (delivery.status !== 'delivered') {
          return;
        }

        totalDeliveries++;
        
        // Delivery man gets 80% of delivery fee
        const deliveryPayout = delivery.deliveryPayout || 0;
        const deliveryPlatformFee = delivery.deliveryPlatformFee || 0;
        
        deliveryFeesEarned += deliveryPayout;
        platformFee += deliveryPlatformFee;

        // Track COD cash collected
        if (delivery.paymentMethod === 'cod' && delivery.paymentStatus === 'completed') {
          codCashCollected += delivery.totalAmount || 0;
        }
      });

      // Fetch pending payouts
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('userId', '==', userId)
      );
      const payoutsSnapshot = await getDocs(payoutsQuery);

      let pendingPayout = 0;
      payoutsSnapshot.docs.forEach((doc) => {
        const payout = doc.data();
        if (payout.status === 'pending' || payout.status === 'approved') {
          pendingPayout += payout.netPayout || 0;
        }
      });

      const availableToWithdraw = deliveryFeesEarned - pendingPayout;

      setEarnings({
        totalDeliveries,
        deliveryFeesEarned,
        platformFee,
        codCashCollected,
        pendingPayout,
        availableToWithdraw: Math.max(0, availableToWithdraw),
      });
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async (data: PayoutRequestData) => {
    try {
      const userId = userData?.uid || currentUser?.uid;
      if (!userId) {
        throw new Error('Missing user ID for payout request');
      }

      // Get all completed deliveries that haven't been paid out
      const deliveriesQuery = query(
        collection(db, 'deliveries'),
        where('deliveryManId', '==', userId)
      );
      const deliveriesSnapshot = await getDocs(deliveriesQuery);

      const orderIds = deliveriesSnapshot.docs
        .map((doc) => doc.data())
        .filter((delivery) => delivery.status === 'delivered' && delivery.deliveryPayoutStatus === 'pending')
        .map((delivery) => delivery.orderId)
        .filter(Boolean);

      await addDoc(collection(db, 'payouts'), {
        userId,
        userName: userData?.name,
        userRole: 'delivery_man',
        amount: data.amount,
        codCashCollected: earnings.codCashCollected,
        netPayout: data.amount - earnings.codCashCollected,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        status: 'pending',
        orderIds,
        paymentIds: [],
        requestedAt: Timestamp.now(),
        notes: data.notes,
      });

      // Refresh earnings
      await fetchEarnings();
    } catch (error) {
      console.error('Payout request error:', error);
      throw error;
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
          <h1 className="text-3xl font-bold text-gray-900">Delivery Earnings</h1>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={earnings.availableToWithdraw <= 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EarningsCard
            title="Total Deliveries"
            amount={earnings.totalDeliveries}
            subtitle="Completed"
            icon={Truck}
            color="blue"
            formatAsCurrency={false}
          />
          <EarningsCard
            title="Delivery Fees"
            amount={earnings.deliveryFeesEarned}
            subtitle="80% of total fees"
            icon={DollarSign}
            color="green"
          />
          <EarningsCard
            title="COD Collected"
            amount={earnings.codCashCollected}
            subtitle="Cash on delivery"
            icon={Banknote}
            color="orange"
          />
          <EarningsCard
            title="Available"
            amount={earnings.availableToWithdraw}
            subtitle="Ready to withdraw"
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Total Deliveries</span>
              <span className="text-xl font-bold text-gray-900">
                {earnings.totalDeliveries}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Delivery Fees Earned (80%)</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(earnings.deliveryFeesEarned)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Platform Fee (20%)</span>
              <span className="text-xl font-bold text-gray-600">
                {formatCurrency(earnings.platformFee)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
              <span className="text-lg font-bold text-gray-900">Your Earnings</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(earnings.deliveryFeesEarned)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">COD Cash Collected</span>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(earnings.codCashCollected)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Pending Payout</span>
              <span className="text-xl font-bold text-yellow-600">
                {formatCurrency(earnings.pendingPayout)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
              <span className="text-lg font-bold text-green-900">Available to Withdraw</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(earnings.availableToWithdraw)}
              </span>
            </div>
          </div>
        </div>

        {/* COD Info */}
        {earnings.codCashCollected > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Banknote className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">COD Cash Reconciliation</h3>
                <p className="text-sm text-orange-800 mb-2">
                  You have collected {formatCurrency(earnings.codCashCollected)} in cash from COD orders.
                </p>
                <p className="text-sm text-orange-800">
                  This amount will be deducted from your payout. Please ensure you have submitted the cash to the admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Payout Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You receive 80% of each delivery fee</li>
                <li>• Payouts are processed within 3-5 business days</li>
                <li>• COD cash collected will be deducted from your payout</li>
                <li>• Minimum payout amount is $10</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableAmount={earnings.availableToWithdraw}
        codCashCollected={earnings.codCashCollected}
        onSubmit={handlePayoutRequest}
        userRole="delivery_man"
      />

      <Footer />
    </div>
  );
};

export default DeliveryEarnings;
