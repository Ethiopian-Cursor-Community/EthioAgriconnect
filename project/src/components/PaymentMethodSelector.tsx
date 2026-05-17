import { CreditCard, Smartphone, Building2, Banknote, Wallet } from 'lucide-react';
import { PaymentMethod } from '../types/payment';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  methods?: PaymentMethod[];
}

const PaymentMethodSelector = ({ 
  selected, 
  onChange, 
  methods = ['mobile_money', 'card', 'bank_transfer', 'cod'] 
}: PaymentMethodSelectorProps) => {
  const paymentMethods = [
    {
      id: 'mobile_money' as PaymentMethod,
      name: 'Mobile Money',
      description: 'Telebirr, M-Pesa, HelloCash, CBE Birr',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer',
      description: 'Upload payment receipt',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'cod' as PaymentMethod,
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: Banknote,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'wallet' as PaymentMethod,
      name: 'Wallet',
      description: 'Use wallet balance',
      icon: Wallet,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ].filter(method => methods.includes(method.id));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select Payment Method
      </label>
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;
        
        return (
          <div
            key={method.id}
            onClick={() => onChange(method.id)}
            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              isSelected
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                checked={isSelected}
                onChange={() => onChange(method.id)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
            </div>
            <div className="ml-3 flex-1 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${method.bgColor}`}>
                <Icon className={`w-6 h-6 ${method.color}`} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                  {method.name}
                </label>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;
