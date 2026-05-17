import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DeliveryAIChatbot from '../../components/DeliveryAIChatbot';
import { Package, MapPin, Phone, User, CheckCircle, XCircle, Eye, Truck } from 'lucide-react';

interface Delivery {
  id: string;
  orderId: string;
  deliveryManId: string;
  deliveryManName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAddress: string;
  consumerId: string;
  consumerName: string;
  consumerPhone: string;
  consumerAddress: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'assigned' | 'accepted' | 'rejected' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  assignedAt: any;
  acceptedAt?: any;
  pickedUpAt?: any;
  onTheWayAt?: any;
  deliveredAt?: any;
  rejectionReason?: string;
  deliveryNotes?: string;
}

const AssignedDeliveries = () => {
  const { userData, currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const userId = userData?.uid || currentUser?.uid;

    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'deliveries'),
      where('deliveryManId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deliveriesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }) as Delivery)
          .filter((delivery) =>
            ['assigned', 'accepted', 'picked_up', 'on_the_way'].includes(delivery.status)
          );

        setDeliveries(deliveriesData);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load assigned deliveries:', error);
        toast.error('Failed to load assigned deliveries');
        setDeliveries([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, userData?.uid]);

  const updateDeliveryStatus = async (
    delivery: Delivery,
    status: Delivery['status'],
    additionalData: Record<string, unknown> = {}
  ) => {
    try {
      const batch = writeBatch(db);
      const deliveryRef = doc(db, 'deliveries', delivery.id);
      const orderRef = doc(db, 'orders', delivery.orderId);

      batch.update(deliveryRef, {
        status,
        ...additionalData,
      });

      const orderUpdate: Record<string, unknown> = {
        deliveryStatus: status,
      };

      if (status === 'accepted') {
        orderUpdate.deliveryAcceptedAt = additionalData.acceptedAt;
      }

      if (status === 'picked_up') {
        orderUpdate.pickedUpAt = additionalData.pickedUpAt;
      }

      if (status === 'on_the_way') {
        orderUpdate.onTheWayAt = additionalData.onTheWayAt;
      }

      if (status === 'delivered') {
        orderUpdate.status = 'delivered';
        orderUpdate.deliveredAt = additionalData.deliveredAt;
      }

      if (status === 'rejected') {
        orderUpdate.deliveryStatus = 'rejected';
        orderUpdate.deliveryRejectedAt = additionalData.rejectedAt;
        orderUpdate.deliveryRejectionReason = additionalData.rejectionReason || '';
      }

      batch.update(orderRef, orderUpdate);
      await batch.commit();
      toast.success(`Delivery ${status.replace('_', ' ')} successfully!`);
    } catch (error) {
      console.error('Failed to update delivery:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const handleAccept = (delivery: Delivery) => {
    updateDeliveryStatus(delivery, 'accepted', { acceptedAt: Timestamp.now() });
  };

  const handleReject = async () => {
    if (!selectedDelivery || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    await updateDeliveryStatus(selectedDelivery, 'rejected', {
      rejectionReason,
      rejectedAt: Timestamp.now(),
    });
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedDelivery(null);
  };

  const handleStartPickup = (delivery: Delivery) => {
    updateDeliveryStatus(delivery, 'picked_up', { pickedUpAt: Timestamp.now() });
  };

  const handleMarkOnTheWay = (delivery: Delivery) => {
    updateDeliveryStatus(delivery, 'on_the_way', { onTheWayAt: Timestamp.now() });
  };

  const handleMarkDelivered = (delivery: Delivery) => {
    updateDeliveryStatus(delivery, 'delivered', { deliveredAt: Timestamp.now() });
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesFilter = filter === 'all' || delivery.status === filter;
    const matchesSearch =
      (delivery.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.consumerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.farmerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      assigned: { color: 'bg-yellow-100 text-yellow-800', text: 'Assigned' },
      accepted: { color: 'bg-blue-100 text-blue-800', text: 'Accepted' },
      picked_up: { color: 'bg-purple-100 text-purple-800', text: 'Picked Up' },
      on_the_way: { color: 'bg-indigo-100 text-indigo-800', text: 'On the Way' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Assigned Deliveries</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="picked_up">Picked Up</option>
                <option value="on_the_way">On the Way</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by order ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No deliveries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order #{delivery.orderId}</h3>
                    <p className="text-gray-600 mt-1">
                      {delivery.productName} ({delivery.quantity} kg)
                    </p>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Pickup From
                    </h4>
                    <div className="pl-6 space-y-1">
                      <p className="text-gray-800 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {delivery.farmerName}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {delivery.farmerPhone}
                      </p>
                      <p className="text-gray-600 text-sm">{delivery.farmerAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Deliver To
                    </h4>
                    <div className="pl-6 space-y-1">
                      <p className="text-gray-800 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {delivery.consumerName}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {delivery.consumerPhone}
                      </p>
                      <p className="text-gray-600 text-sm">{delivery.consumerAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ${(delivery.totalPrice || 0).toFixed(2)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {delivery.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleAccept(delivery)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {delivery.status === 'accepted' && (
                      <button
                        onClick={() => handleStartPickup(delivery)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Start Pickup
                      </button>
                    )}
                    {delivery.status === 'picked_up' && (
                      <button
                        onClick={() => handleMarkOnTheWay(delivery)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        Mark On the Way
                      </button>
                    )}
                    {delivery.status === 'on_the_way' && (
                      <button
                        onClick={() => handleMarkDelivered(delivery)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDelivery(delivery)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Delivery</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this delivery:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedDelivery(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <DeliveryAIChatbot
        deliveryContext={{
          orderId: selectedDelivery?.orderId,
          productName: selectedDelivery?.productName,
          currentStatus: selectedDelivery?.status,
          pickupAddress: selectedDelivery?.farmerAddress,
          deliveryAddress: selectedDelivery?.consumerAddress,
        }}
      />
    </div>
  );
};

export default AssignedDeliveries;
