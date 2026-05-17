import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData?.role === 'farmer') {
      navigate('/farmer/products');
    } else if (userData?.role === 'delivery_man') {
      navigate('/delivery/dashboard');
    } else if (userData?.role === 'consumer') {
      navigate('/marketplace');
    }
  }, [userData, navigate]);

  if (userData && !['admin', 'farmer', 'delivery_man', 'consumer'].includes(userData.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unsupported account role</h1>
          <p className="mt-2 text-gray-600">
            This account does not have a valid dashboard role assigned.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
};

export default Dashboard;
