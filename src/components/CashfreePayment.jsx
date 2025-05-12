import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';
import { pdfApi } from '../services/api';
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';

const CashfreePayment = ({ pdf, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();
  
  // Initialize Cashfree SDK
  useEffect(() => {
    const initCashfree = async () => {
      try {
        window.cashfree = await load({
          mode: "sandbox", // Change to "production" for live mode
        });
      } catch (err) {
        console.error('Error initializing Cashfree SDK:', err);
        setError('Failed to initialize payment gateway');
      }
    };
    
    initCashfree();
  }, []);
  
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get session ID from backend
      const response = await pdfApi.createPaymentSession(pdf._id);
      
      if (!response.data || !response.data.data || !response.data.data.payment_session_id) {
        throw new Error('Failed to create payment session');
      }
      
      const { payment_session_id, order_id } = response.data.data;
      setOrderId(order_id);
      
      // Initialize Cashfree checkout
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal", // Use "_self" to redirect the entire page
      };
      
      // Launch Cashfree checkout
      window.cashfree.checkout(checkoutOptions).then(() => {
        console.log('Payment initialized');
        // Payment verification will be handled by the return_url
      }).catch(err => {
        console.error('Checkout error:', err);
        setError('Payment initialization failed');
      });
    } catch (err) {
      console.error('Error handling payment:', err);
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Details</h3>
        <p className="text-gray-600 mb-4">
          You're purchasing <span className="font-semibold">{pdf.title}</span> for ₹{pdf.price.toFixed(2)}
        </p>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <FiLock className="h-4 w-4 mr-1" />
          <span>Payments are secure and processed by Cashfree</span>
        </div>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
            Processing...
          </span>
        ) : (
          `Pay ₹${pdf.price.toFixed(2)}`
        )}
      </button>
      
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="w-full mt-2 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-100 focus:outline-none"
      >
        Cancel
      </button>
    </div>
  );
};

export default CashfreePayment;