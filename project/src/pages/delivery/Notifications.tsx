import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Bell, Trash2, AlertCircle, MessageSquare, Info } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: 'new_delivery' | 'cancellation' | 'admin_message' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  relatedDeliveryId?: string;
}

const Notifications = () => {
  const { userData, currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const userId = userData?.uid || currentUser?.uid;

    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }) as Notification)
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0;
            const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime;
          });

        setNotifications(notificationsData);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load notifications:', error);
        toast.error('Failed to load notifications');
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, userData?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, { icon: any; color: string }> = {
      new_delivery: { icon: Bell, color: 'text-blue-600' },
      cancellation: { icon: AlertCircle, color: 'text-red-600' },
      admin_message: { icon: MessageSquare, color: 'text-purple-600' },
      system_alert: { icon: Info, color: 'text-yellow-600' },
    };
    return icons[type] || { icon: Bell, color: 'text-gray-600' };
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'unread' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('new_delivery')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'new_delivery' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setFilter('admin_message')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'admin_message' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color } = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg ${
                    !notification.read ? 'border-l-4 border-green-600' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {notification.createdAt?.toDate?.()?.toLocaleString?.() || 'No date'}
                        </p>
                        {!notification.read && (
                          <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;
