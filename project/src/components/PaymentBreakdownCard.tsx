import { Info } from 'lucide-react';
import { formatCurrency } from '../lib/payment';

interface PaymentBreakdownCardProps {
  productAmount: number;
  deliveryFee: number;
  adminTax?: number;
  showDetails?: boolean;
}

const PaymentBreakdownCard = ({ 
  productAmount, 
  deliveryFee, 
  adminTax,
  showDetails = true 
}: PaymentBreakdownCardProps) => {
  const totalAmount = productAmount + deliveryFee;
  const calculatedAdminTax = adminTax || productAmount * 0.07;

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>Product Subtotal</span>
          <span className="font-medium">{formatCurrency(productAmount)}</span>
        </div>
        
        <div className="flex justify-between text-gray-700">
          <span>Delivery Fee</span>
          <span className="font-medium">{formatCurrency(deliveryFee)}</span>
        </div>
        
        {showDetails && (
          <div className="pt-2 border-t border-gray-300">
            <div className="flex items-start justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                <span>Platform Fee (7%)</span>
              </div>
              <span>{formatCurrency(calculatedAdminTax)}</span>
            </div>
            <p className="text-xs text-gray-500 italic">
              This fee supports platform operations and is deducted from farmer revenue
            </p>
          </div>
        )}
        
        <div className="pt-3 border-t-2 border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdownCard;
