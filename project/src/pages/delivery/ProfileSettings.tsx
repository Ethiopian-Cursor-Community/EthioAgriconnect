import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { User, Phone, Truck, Camera, LogOut, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  availabilityStatus: 'available' | 'busy' | 'offline';
  profilePhoto?: string;
}

const ProfileSettings = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehiclePlate: '',
    availabilityStatus: 'available',
  });
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    successRate: 0,
    avgRating: 0,
    memberSince: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [userData]);

  const fetchProfileData = async () => {
    try {
      if (!userData?.uid) return;

      const userDoc = await getDoc(doc(db, 'users', userData.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          vehicleType: data.vehicleType || '',
          vehiclePlate: data.vehiclePlate || '',
          availabilityStatus: data.availabilityStatus || 'available',
          profilePhoto: data.profilePhoto || '',
        });

        setStats({
          totalDeliveries: data.totalDeliveries || 0,
          successRate: data.successRate || 0,
          avgRating: data.avgRating || 0,
          memberSince: data.createdAt?.toDate().toLocaleDateString() || 'N/A',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!userData?.uid) return;

      await updateDoc(doc(db, 'users', userData.uid), {
        name: profile.name,
        phone: profile.phone,
        vehicleType: profile.vehicleType,
        vehiclePlate: profile.vehiclePlate,
        availabilityStatus: profile.availabilityStatus,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
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
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-blue-600">{stats.successRate}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="text-lg font-bold text-gray-900">{stats.memberSince}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4 inline mr-2" />
                  Vehicle Type
                </label>
                <select
                  value={profile.vehicleType}
                  onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select vehicle type</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={profile.vehiclePlate}
                  onChange={(e) => setProfile({ ...profile, vehiclePlate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
              <select
                value={profile.availabilityStatus}
                onChange={(e) => setProfile({ ...profile, availabilityStatus: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSettings;
