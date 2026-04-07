import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentAPI } from '../services/api';

const PaymentModal = ({ isOpen, onClose, paymentData, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await paymentAPI.createOrder({
        paymentType: paymentData.paymentType,
        amount: paymentData.amount,
        referenceId: paymentData.referenceId,
        description: paymentData.description,
      });

      const order = orderResponse.data;

      // Razorpay checkout options
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount * 100, // Convert to paise
        currency: order.currency,
        name: 'LibPortal Library',
        description: order.description,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success('Payment successful!');
            onSuccess?.();
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: paymentData.userName || '',
          email: paymentData.userEmail || '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.response?.data || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Make Payment</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-600">Payment Type:</span>
              <span className="text-sm font-medium text-gray-800">
                {paymentData.paymentType === 'FINE_PAYMENT' ? 'Fine Payment' : 'Membership Payment'}
              </span>
            </div>
            {paymentData.description && (
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm text-gray-800 text-right max-w-[200px]">
                  {paymentData.description}
                </span>
              </div>
            )}
            <div className="flex justify-between items-start pt-2 border-t border-blue-200 mt-2">
              <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
              <span className="text-2xl font-bold text-blue-600">₹{paymentData.amount}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• You will be redirected to Razorpay payment gateway</p>
            <p>• Payment is secure and encrypted</p>
            <p>• You will receive a receipt via email after successful payment</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
