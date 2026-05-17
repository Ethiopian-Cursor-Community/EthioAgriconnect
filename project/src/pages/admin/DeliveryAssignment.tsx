import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, Timestamp, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { Truck, Package, User, MapPin } from 'lucide-react';

interface Order {
  id: string;
  farmerId?: string;
  farmerName: string;
  consumerId?: string;
  consumerName: string;
  deliveryAddress: string;
  deliveryPhone?: string;
  totalAmount: number;
  deliveryFee?: number;
  items?: Array<{ productName: string; quantity: number }>;
  status: string;
  createdAt: any;
}

interface DeliveryMan {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vehicleType?: string;
  availabilityStatus?: string;
}

const DeliveryAssignment = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const safeText = (value: unknown, fallback = '') => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || fallback;
    }

    return fallback;
  };

  const fetchData = async () => {
    try {
      // Fetch unassigned orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'pending')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((order: any) => !order.deliveryManId) as Order[];
      
      setOrders(ordersData);

      // Fetch delivery personnel
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'delivery_man')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const deliveryData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DeliveryMan[];
      
      setDeliveryMen(deliveryData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryMan) {
      toast.error('Please select both order and delivery person');
      return;
    }

    try {
      const deliveryMan = deliveryMen.find((d) => d.id === selectedDeliveryMan);
      if (!deliveryMan) return;

      const deliveryManName = safeText(deliveryMan.name, safeText(deliveryMan.email, 'Delivery Personnel'));
      const consumerName = safeText(selectedOrder.consumerName, 'Customer');
      const farmerName = safeText(selectedOrder.farmerName, 'Farmer');
      const consumerAddress = safeText(selectedOrder.deliveryAddress, 'Address not provided');
      const consumerPhone = safeText(selectedOrder.deliveryPhone, 'Phone not provided');
      const deliveryFee = selectedOrder.deliveryFee ?? 10;
      const productName = safeText(selectedOrder.items?.[0]?.productName, 'Multiple items');
      const quantity =
        selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      const deliveryRef = doc(collection(db, 'deliveries'));

      // Create delivery record
      await setDoc(deliveryRef, {
        orderId: selectedOrder.id,
        deliveryManId: deliveryMan.id,
        deliveryManName,
        farmerId: safeText(selectedOrder.farmerId),
        farmerName,
        farmerAddress: '',
        farmerPhone: '',
        consumerId: safeText(selectedOrder.consumerId),
        consumerName,
        consumerAddress,
        consumerPhone,
        productName,
        quantity,
        totalPrice: selectedOrder.totalAmount,
        deliveryFee,
        deliveryPayout: deliveryFee * 0.8,
        deliveryPlatformFee: deliveryFee * 0.2,
        deliveryPayoutStatus: 'pending',
        status: 'assigned',
        assignedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      // Update order with delivery man info
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        deliveryManId: deliveryMan.id,
        deliveryManName,
        deliveryId: deliveryRef.id,
        deliveryStatus: 'assigned',
      });

      // Create notification for delivery man
      await addDoc(collection(db, 'notifications'), {
        userId: deliveryMan.id,
        type: 'new_delivery',
        title: 'New Delivery Assigned',
        message: `You have been assigned a delivery to ${consumerName}`,
        read: false,
        createdAt: Timestamp.now(),
        relatedDeliveryId: deliveryRef.id,
      });

      toast.success('Delivery assigned successfully!');
      setSelectedOrder(null);
      setSelectedDeliveryMan('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign delivery:', error);
      toast.error('Failed to assign delivery');
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
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Assignment</h1>
          <p className="text-gray-600">Assign delivery personnel to pending orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unassigned Orders */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              Unassigned Orders ({orders.length})
            </h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No unassigned orders</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition ${
                      selectedOrder?.id === order.id
                        ? 'ring-2 ring-green-600 shadow-lg'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.items?.length || 0} item(s)
                        </h3>
                        <p className="text-sm text-gray-600">from {order.farmerName}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{order.consumerName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{order.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delivery Personnel */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-green-600" />
              Delivery Personnel ({deliveryMen.length})
            </h2>
            
            {selectedOrder && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Selected Order: {selectedOrder.items?.length || 0} items to {selectedOrder.consumerName}
                </p>
                <p className="text-xs text-blue-700">
                  Select a delivery person below to assign
                </p>
              </div>
            )}

            <div className="space-y-4">
              {deliveryMen.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No delivery personnel available</p>
                  <p className="text-sm text-gray-500">
                    Assign delivery_man role to users in User Management
                  </p>
                </div>
              ) : (
                deliveryMen.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedDeliveryMan(person.id)}
                    className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition ${
                      selectedDeliveryMan === person.id
                        ? 'ring-2 ring-green-600 shadow-lg'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.email}</p>
                        {person.phone && (
                          <p className="text-sm text-gray-600">📞 {person.phone}</p>
                        )}
                        {person.vehicleType && (
                          <p className="text-xs text-gray-500 mt-1">
                            🚗 {person.vehicleType}
                          </p>
                        )}
                      </div>
                      {person.availabilityStatus && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            person.availabilityStatus === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {person.availabilityStatus}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedOrder && selectedDeliveryMan && (
              <button
                onClick={assignDelivery}
                className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition"
              >
                Assign Delivery
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeliveryAssignment;
