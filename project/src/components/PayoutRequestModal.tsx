import { useState } from 'react';
import { X, DollarSign, Building2, User, CreditCard } from 'lucide-react';
import { formatCurrency, validateBankAccount } from '../lib/payment';
import toast from 'react-hot-toast';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  codCashCollected?: number;
  onSubmit: (data: PayoutRequestData) => Promise<void>;
  userRole: 'farmer' | 'delivery_man';
}

export interface PayoutRequestData {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

const PayoutRequestModal = ({
  isOpen,
  onClose,
  availableAmount,
  codCashCollected = 0,
  onSubmit,
  userRole,
}: PayoutRequestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PayoutRequestData>({
    amount: availableAmount,
    bankName: '',
    accountNumber: '',
    accountName: '',
    notes: '',
  });

  const netPayout = formData.amount - codCashCollected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBankAccount(formData.accountNumber)) {
      toast.error('Invalid bank account number');
      return;
    }

    if (formData.amount > availableAmount) {
      toast.error('Amount exceeds available balance');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Payout request submitted successfully!');
      onClose();
      setFormData({
        amount: availableAmount,
        bankName: '',
        accountNumber: '',
        accountName: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to submit payout request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Payout Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Available Amount:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(availableAmount)}
                </span>
              </div>
              {codCashCollected > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-700">COD Cash Collected:</span>
                    <span className="font-medium text-orange-600">
                      -{formatCurrency(codCashCollected)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-300 flex justify-between">
                    <span className="font-semibold text-gray-900">Net Payout:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(netPayout)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                max={availableAmount}
                min="0"
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(availableAmount)}
            </p>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Commercial Bank of Ethiopia"
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1234567890"
              />
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Full name as per bank account"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Any additional information..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutRequestModal;
