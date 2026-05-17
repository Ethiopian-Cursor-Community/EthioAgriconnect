import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { PaymentStatus } from '../types/payment';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const PaymentStatusBadge = ({ status, size = 'md' }: PaymentStatusBadgeProps) => {
  const configs = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    refunded: {
      label: 'Refunded',
      icon: RefreshCw,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;
