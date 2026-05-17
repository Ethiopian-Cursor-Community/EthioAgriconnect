import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../lib/payment';

interface EarningsCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  formatAsCurrency?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const EarningsCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  color = 'green',
  formatAsCurrency = true,
  trend,
}: EarningsCardProps) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border ${colors.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatAsCurrency ? formatCurrency(amount) : amount.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-8 h-8 ${colors.text}`} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">from last month</span>
        </div>
      )}
    </div>
  );
};

export default EarningsCard;
