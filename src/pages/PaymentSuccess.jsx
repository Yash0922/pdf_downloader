import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiDownload, FiAlertCircle, FiHome } from 'react-icons/fi';
import { pdfApi } from '../services/api';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDetails, setPdfDetails] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAndDownload = async () => {
      try {
        console.log('Query parameters:', location.search);
        
        // Get query parameters
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('order_id');
        const pdfId = searchParams.get('pdf_id');
        
        console.log('Processing payment:', { orderId, pdfId });
        
        if (!orderId || !pdfId) {
          throw new Error('Missing required parameters');
        }
        
        // Step 1: Verify payment
        console.log('Verifying payment...');
        await pdfApi.verifyPayment(orderId, pdfId);
        
        // Step 2: Get PDF details
        console.log('Getting PDF details...');
        const pdfResponse = await pdfApi.getById(pdfId);
        setPdfDetails(pdfResponse.data.data);
        
        // Step 3: Auto-download the PDF
        console.log('Starting auto-download...');
        await downloadPdf(pdfId, pdfResponse.data.data.title);
        
        setDownloadComplete(true);
      } catch (err) {
        console.error('Error in payment process:', err);
        setError(err.response?.data?.message || 'Failed to process payment');
      } finally {
        setVerifying(false);
      }
    };
    
    verifyAndDownload();
  }, [location.search]);
  
  const downloadPdf = async (pdfId, title) => {
    try {
      setDownloading(true);
      
      // Call the download API
      const response = await pdfApi.download(pdfId);
      
      // Create a blob URL for the file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = title + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('Download successful');
      return true;
    } catch (err) {
      console.error('Error downloading PDF:', err);
      throw err;
    } finally {
      setDownloading(false);
    }
  };
  
  const handleManualDownload = () => {
    if (!pdfDetails) return;
    
    downloadPdf(pdfDetails._id, pdfDetails.title)
      .then(() => {
        setDownloadComplete(true);
      })
      .catch((err) => {
        setError('Failed to download PDF. Please try again.');
      });
  };
  
  if (verifying) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Payment</h2>
        <p className="text-gray-600">Please wait while we confirm your purchase and prepare your download.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="bg-red-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          
          <p className="text-gray-600 mb-6 text-center">
            There was a problem processing your payment. If you believe this is an error and the payment was successful, 
            please contact our support team.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <FiHome className="mr-2" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="h-12 w-12 text-green-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Thank you for your purchase.</p>
          
          {downloadComplete && (
            <div className="mt-4 bg-green-50 p-3 rounded-md inline-block">
              <p className="text-green-700">
                <FiCheck className="inline mr-1" /> Your download has started
              </p>
            </div>
          )}
        </div>
        
        {pdfDetails && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Purchase Details</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <div className="text-gray-500 text-2xl">PDF</div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{pdfDetails.title}</h4>
                  <p className="text-sm text-gray-500 mb-1">
                    {pdfDetails.size} • Added {new Date(pdfDetails.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-blue-600 font-medium">₹{pdfDetails.price.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{pdfDetails.description}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <p className="text-center text-gray-600 mb-2">
            {downloadComplete 
              ? "If your download didn't start automatically, click the button below:" 
              : "Your PDF is ready to download:"}
          </p>
          
          <button
            onClick={handleManualDownload}
            disabled={downloading}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                Downloading...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                {downloadComplete ? "Download Again" : "Download PDF"}
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
          >
            <FiHome className="mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;