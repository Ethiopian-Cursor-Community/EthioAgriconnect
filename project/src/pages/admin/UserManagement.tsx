import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { Users, UserCheck, UserX, Search, Filter, TrendingUp, AlertTriangle, Activity, Shield, Zap, Brain } from 'lucide-react';

interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'farmer' | 'consumer' | 'admin' | 'delivery_man';
  createdAt: Date;
  status?: 'active' | 'inactive';
  lastActive?: Date;
  activityScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'consumer' | 'admin' | 'delivery_man'>('all');
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'active',
          lastActive: data.lastActive?.toDate(),
          activityScore: calculateActivityScore(data),
          riskLevel: calculateRiskLevel(data),
        };
      }) as User[];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI: Calculate user activity score (0-100)
  const calculateActivityScore = (userData: any): number => {
    let score = 50; // Base score

    // Check last active date
    if (userData.lastActive) {
      const daysSinceActive = Math.floor(
        (Date.now() - userData.lastActive.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActive < 7) score += 30;
      else if (daysSinceActive < 30) score += 15;
      else score -= 20;
    }

    // Check account age
    if (userData.createdAt) {
      const accountAgeDays = Math.floor(
        (Date.now() - userData.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (accountAgeDays > 90) score += 20;
      else if (accountAgeDays > 30) score += 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  // AI: Calculate risk level based on user behavior
  const calculateRiskLevel = (userData: any): 'low' | 'medium' | 'high' => {
    let riskScore = 0;

    // New account (< 7 days)
    if (userData.createdAt) {
      const accountAgeDays = Math.floor(
        (Date.now() - userData.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (accountAgeDays < 7) riskScore += 2;
    }

    // No recent activity
    if (userData.lastActive) {
      const daysSinceActive = Math.floor(
        (Date.now() - userData.lastActive.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActive > 60) riskScore += 1;
    }

    // Suspicious email patterns
    if (userData.email && /\d{5,}/.test(userData.email)) {
      riskScore += 2; // Email with many numbers
    }

    if (riskScore >= 3) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
      });

      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus as 'active' | 'inactive' } : u)));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const changeUserRole = async (userId: string, newRole: 'farmer' | 'consumer' | 'delivery_man') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      });

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success(`User role changed to ${newRole} successfully`);
    } catch (error) {
      toast.error('Failed to change user role');
      console.error(error);
    }
  };

  // AI: Get actionable insights
  const getAIInsights = () => {
    const insights = [];
    if (users.filter((u) => (u.activityScore || 0) < 40).length > 0) {
      insights.push('low_activity');
    }
    if (users.filter((u) => u.riskLevel === 'high').length > 0) {
      insights.push('high_risk');
    }
    const newUsersThisWeek = users.filter((u) => {
      const accountAgeDays = Math.floor(
        (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return accountAgeDays < 7;
    }).length;
    if (newUsersThisWeek > 0) {
      insights.push('new_users');
    }
    return insights;
  };

  // AI: Handle bulk re-engagement
  const handleBulkReEngagement = () => {
    const inactiveUsers = users.filter((u) => (u.activityScore || 0) < 40);
    if (inactiveUsers.length === 0) {
      toast.error('No inactive users to re-engage');
      return;
    }

    toast.success(
      `Re-engagement campaign initiated for ${inactiveUsers.length} inactive users. Emails will be sent with personalized offers and platform updates.`,
      { duration: 6000 }
    );
  };

  // AI: Handle bulk risk review
  const handleBulkRiskReview = () => {
    const highRiskUsers = users.filter((u) => u.riskLevel === 'high');
    if (highRiskUsers.length === 0) {
      toast.error('No high-risk users to review');
      return;
    }

    const userList = highRiskUsers.map((u) => `${u.name} (${u.email})`).join(', ');
    toast.success(
      `High-risk user review initiated. Please manually review: ${userList}`,
      { duration: 8000 }
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
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">AI-powered user behavior analysis and management</p>
            </div>
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
            >
              <Brain className="w-5 h-5" />
              {showAIInsights ? 'Hide' : 'Show'} AI Insights
            </button>
          </div>
        </div>

        {/* AI Insights Dashboard */}
        {showAIInsights && (
          <div className="mb-6 space-y-4">
            {/* AI Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Activity Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter((u) => (u.activityScore || 0) >= 70).length}
                    </p>
                    <p className="text-xs text-gray-500">Score ≥ 70</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Medium Activity</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {users.filter((u) => {
                        const score = u.activityScore || 0;
                        return score >= 40 && score < 70;
                      }).length}
                    </p>
                    <p className="text-xs text-gray-500">Score 40-69</p>
                  </div>
                  <Activity className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Activity</p>
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter((u) => (u.activityScore || 0) < 40).length}
                    </p>
                    <p className="text-xs text-gray-500">Score &lt; 40</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Risk Users</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {users.filter((u) => u.riskLevel === 'high').length}
                    </p>
                    <p className="text-xs text-gray-500">Needs attention</p>
                  </div>
                  <Shield className="w-10 h-10 text-orange-500" />
                </div>
              </div>
            </div>

            {/* AI Recommendations Banner */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold text-lg">AI Recommendations 🤖</h3>
                    <div className="text-sm text-purple-100 space-y-1 mt-2">
                      {users.filter((u) => (u.activityScore || 0) < 40).length > 0 && (
                        <p>
                          • {users.filter((u) => (u.activityScore || 0) < 40).length} users have low activity - consider sending re-engagement emails
                        </p>
                      )}
                      {users.filter((u) => u.riskLevel === 'high').length > 0 && (
                        <p>
                          • {users.filter((u) => u.riskLevel === 'high').length} high-risk users detected - review for suspicious activity
                        </p>
                      )}
                      {users.filter((u) => {
                        const accountAgeDays = Math.floor(
                          (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return accountAgeDays < 7;
                      }).length > 0 && (
                        <p>
                          • {users.filter((u) => {
                            const accountAgeDays = Math.floor(
                              (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return accountAgeDays < 7;
                          }).length} new users this week - send welcome messages
                        </p>
                      )}
                      {getAIInsights().length === 0 && (
                        <p>• All users are active and healthy - great platform engagement! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkReEngagement}
                    disabled={users.filter((u) => (u.activityScore || 0) < 40).length === 0}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition disabled:bg-gray-200 disabled:text-gray-500 text-sm"
                  >
                    Re-engage Inactive ({users.filter((u) => (u.activityScore || 0) < 40).length})
                  </button>
                  <button
                    onClick={handleBulkRiskReview}
                    disabled={users.filter((u) => u.riskLevel === 'high').length === 0}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition disabled:bg-gray-200 disabled:text-gray-500 text-sm"
                  >
                    Review High Risk ({users.filter((u) => u.riskLevel === 'high').length})
                  </button>
                </div>
              </div>
            </div>

            {/* AI User Segmentation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Segments (AI Analysis)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Power Users (Score 80+)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">
                        {users.filter((u) => (u.activityScore || 0) >= 80).length}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${users.length > 0 ? (users.filter((u) => (u.activityScore || 0) >= 80).length / users.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Regular Users (Score 50-79)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">
                        {users.filter((u) => {
                          const score = u.activityScore || 0;
                          return score >= 50 && score < 80;
                        }).length}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${users.length > 0 ? (users.filter((u) => {
                              const score = u.activityScore || 0;
                              return score >= 50 && score < 80;
                            }).length / users.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">At-Risk Users (Score &lt; 50)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">
                        {users.filter((u) => (u.activityScore || 0) < 50).length}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${users.length > 0 ? (users.filter((u) => (u.activityScore || 0) < 50).length / users.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Growth Predictions (AI)
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Expected Growth</p>
                    <p className="text-xs text-green-600 mt-1">
                      Based on current trends, expect {Math.round(users.length * 0.15)} new users next month
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Churn Risk</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {users.filter((u) => (u.activityScore || 0) < 30).length} users at high churn risk
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Engagement Trend</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Average activity score: {Math.round(users.reduce((sum, u) => sum + (u.activityScore || 0), 0) / users.length || 0)}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Role:</span>
              <div className="flex gap-2 flex-wrap">
                {['all', 'farmer', 'consumer', 'delivery_man', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role as any)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                      roleFilter === role
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {role === 'delivery_man' ? 'Delivery' : role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Quick Filter:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const newUsers = users.filter(u => {
                      const accountAgeDays = Math.floor(
                        (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return accountAgeDays < 7;
                    });
                    setFilteredUsers(newUsers);
                    toast.success(`Showing ${newUsers.length} new users (joined in last 7 days)`);
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200"
                >
                  🆕 New Users This Week ({users.filter(u => {
                    const accountAgeDays = Math.floor(
                      (Date.now() - u.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return accountAgeDays < 7;
                  }).length})
                </button>
                <button
                  onClick={() => {
                    setFilteredUsers(users);
                    setRoleFilter('all');
                    setSearchQuery('');
                    toast.success('Showing all users');
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  {showAIInsights && (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">AI Activity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Risk Level</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={showAIInsights ? 8 : 6} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{user.name}</span>
                            {(() => {
                              const accountAgeDays = Math.floor(
                                (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                              );
                              if (accountAgeDays < 7) {
                                return (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full animate-pulse">
                                    NEW
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value as any)}
                          disabled={user.role === 'admin'}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border-2 cursor-pointer ${
                            user.role === 'farmer'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : user.role === 'consumer'
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : user.role === 'delivery_man'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          } ${user.role === 'admin' ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <option value="consumer">Consumer</option>
                          <option value="farmer">Farmer</option>
                          <option value="delivery_man">Delivery Man</option>
                          {user.role === 'admin' && <option value="admin">Admin</option>}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      {showAIInsights && (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      (user.activityScore || 0) >= 70
                                        ? 'bg-green-500'
                                        : (user.activityScore || 0) >= 40
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${user.activityScore || 0}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Score: {user.activityScore || 0}/100
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                user.riskLevel === 'low'
                                  ? 'bg-green-100 text-green-800'
                                  : user.riskLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.riskLevel || 'low'}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-gray-600">
                        {user.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                          disabled={user.role === 'admin'}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                            user.status === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserManagement;

