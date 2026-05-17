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
import { DollarSign, TrendingUp, Clock, CheckCircle, Minus } from 'lucide-react';

interface EarningsData {
  totalSales: number;
  adminTax: number;
  netEarnings: number;
  pendingPayout: number;
  availableToWithdraw: number;
  completedOrders: number;
}

const Earnings = () => {
  const { userData } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalSales: 0,
    adminTax: 0,
    netEarnings: 0,
    pendingPayout: 0,
    availableToWithdraw: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [userData]);

  const fetchEarnings = async () => {
    try {
      // Fetch all orders for this farmer
      const ordersQuery = query(
        collection(db, 'orders'),
        where('farmerId', '==', userData?.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      let totalSales = 0;
      let adminTax = 0;
      let netEarnings = 0;
      let completedOrders = 0;

      ordersSnapshot.docs.forEach((doc) => {
        const order = doc.data();
        if (order.paymentStatus === 'completed' || order.paymentStatus === 'paid') {
          totalSales += order.productAmount || 0;
          adminTax += order.adminTax || 0;
          netEarnings += order.farmerPayout || 0;
          
          if (order.status === 'delivered') {
            completedOrders++;
          }
        }
      });

      // Fetch pending payouts
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('userId', '==', userData?.uid),
        where('status', 'in', ['pending', 'approved'])
      );
      const payoutsSnapshot = await getDocs(payoutsQuery);

      let pendingPayout = 0;
      payoutsSnapshot.docs.forEach((doc) => {
        pendingPayout += doc.data().amount || 0;
      });

      const availableToWithdraw = netEarnings - pendingPayout;

      setEarnings({
        totalSales,
        adminTax,
        netEarnings,
        pendingPayout,
        availableToWithdraw: Math.max(0, availableToWithdraw),
        completedOrders,
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
      // Get all completed orders that haven't been paid out
      const ordersQuery = query(
        collection(db, 'orders'),
        where('farmerId', '==', userData?.uid),
        where('status', '==', 'delivered'),
        where('farmerPayoutStatus', '==', 'pending')
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      const orderIds = ordersSnapshot.docs.map(doc => doc.id);
      const paymentIds = ordersSnapshot.docs.map(doc => doc.data().paymentId).filter(Boolean);

      await addDoc(collection(db, 'payouts'), {
        userId: userData?.uid,
        userName: userData?.name,
        userRole: 'farmer',
        amount: data.amount,
        netPayout: data.amount,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        status: 'pending',
        orderIds,
        paymentIds,
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
          <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
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
            title="Total Sales"
            amount={earnings.totalSales}
            subtitle={`${earnings.completedOrders} completed orders`}
            icon={DollarSign}
            color="blue"
          />
          <EarningsCard
            title="Admin Tax (7%)"
            amount={earnings.adminTax}
            subtitle="Platform fee"
            icon={Minus}
            color="red"
          />
          <EarningsCard
            title="Net Earnings"
            amount={earnings.netEarnings}
            subtitle="After tax deduction"
            icon={TrendingUp}
            color="green"
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
              <span className="text-gray-700 font-medium">Total Sales</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(earnings.totalSales)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Admin Tax (7%)</span>
              <span className="text-xl font-bold text-red-600">
                -{formatCurrency(earnings.adminTax)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
              <span className="text-lg font-bold text-gray-900">Net Earnings</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(earnings.netEarnings)}
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

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Payout Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Payouts are processed within 3-5 business days</li>
                <li>• A 7% platform fee is automatically deducted from your sales</li>
                <li>• You can request a payout once your available balance is above $10</li>
                <li>• Ensure your bank details are correct before requesting a payout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableAmount={earnings.availableToWithdraw}
        onSubmit={handlePayoutRequest}
        userRole="farmer"
      />

      <Footer />
    </div>
  );
};

export default Earnings;
