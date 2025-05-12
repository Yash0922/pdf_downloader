import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiFile, FiSearch, FiCheck, FiEye, FiInfo, FiAlertCircle, FiShoppingCart, FiLock } from 'react-icons/fi';
import { pdfApi, userApi } from '../services/api';
import { load } from '@cashfreepayments/cashfree-js';

const Dashboard = ({ user }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState({});
  const [purchasedPdfIds, setPurchasedPdfIds] = useState([]);
  const [showingPayment, setShowingPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
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

  // Fetch PDFs and user's purchased PDFs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all PDFs
        const pdfResponse = await pdfApi.getAll();
        setPdfs(pdfResponse.data.data);
        console.log('Fetched PDFs:', pdfResponse.data.data);
        
        // Fetch user profile to get purchased PDFs
        const userResponse = await userApi.getProfile();
        const purchasedIds = userResponse.data.data.pdfsPurchased.map(pdf => pdf._id);
        setPurchasedPdfIds(purchasedIds);
        console.log('Purchased PDF IDs:', purchasedIds);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load PDFs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDownload = async (pdf) => {
    try {
      // Check if PDF is paid and not purchased
      // IMPORTANT: We need to check !pdf.isFree instead of pdf.isPaid
      if (!pdf.isFree && !purchasedPdfIds.includes(pdf._id)) {
        console.log('PDF requires purchase, showing payment screen:', pdf.title);
        setShowingPayment(pdf);
        return;
      }
      
      console.log('Downloading PDF:', pdf.title);
      setDownloading(prev => ({ ...prev, [pdf._id]: true }));
      
      try {
        // Call the download API
        const response = await pdfApi.download(pdf._id);
        
        // Create a blob URL for the file
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create an anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = pdf.title + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        console.log('Download successful');
        
        // Show success notification
        const notification = document.getElementById('download-notification');
        notification.classList.remove('hidden');
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      } catch (err) {
        console.error('Error downloading PDF:', err);
        
        if (err.response && err.response.status === 403) {
          // PDF requires purchase - show payment interface
          console.log('Server indicated PDF requires purchase');
          setShowingPayment(pdf);
        } else {
          setError(`Failed to download ${pdf.title}. ${err.response?.data?.message || 'Please try again.'}`);
        }
      }
    } finally {
      setDownloading(prev => ({ ...prev, [pdf._id]: false }));
    }
  };
  
 // Update this function in your Dashboard component

const handlePayment = async (pdf) => {
  try {
    console.log('Initiating payment for PDF:', pdf.title);
    setPaymentLoading(true);
    setPaymentError(null);
    
    // Get session ID from backend
    const response = await pdfApi.createPaymentSession(pdf._id);
    
    if (!response.data || !response.data.data || !response.data.data.payment_session_id) {
      throw new Error('Failed to create payment session');
    }
    
    const { payment_session_id, order_id } = response.data.data;
    console.log('Payment session created:', { payment_session_id, order_id });
    
    // Initialize Cashfree checkout
    const checkoutOptions = {
      paymentSessionId: payment_session_id,
      redirectTarget: "_self", // Changed from "_modal" to "_self" for full redirect
      // This ensures the page will reload completely to the return_url
      // after payment is completed
      environment: "sandbox", // Make sure this matches your backend setting
      // Adding callback to improve compatibility
      callbacks: {
        onPaymentSuccess: (data) => {
          console.log('Payment success callback:', data);
          // Will redirect automatically because of redirectTarget: "_self"
        },
        onPaymentFailure: (data) => {
          console.log('Payment failure callback:', data);
          setPaymentError('Payment failed: ' + (data.reason || 'Unknown error'));
          setPaymentLoading(false);
        }
      }
    };
    
    console.log('Opening Cashfree checkout with options:', checkoutOptions);
    
    // Launch Cashfree checkout
    window.cashfree.checkout(checkoutOptions).then(() => {
      console.log('Payment initialized');
      // Payment verification will be handled by the return_url
      // and the redirectTarget: "_self" will cause a full redirect
    }).catch(err => {
      console.error('Checkout error:', err);
      setPaymentError('Payment initialization failed: ' + (err.message || 'Unknown error'));
      setPaymentLoading(false);
    });
  } catch (err) {
    console.error('Error handling payment:', err);
    setPaymentError(err.response?.data?.message || 'Payment processing failed');
    setPaymentLoading(false);
  }
};

  // Filter PDFs based on search term
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pdf.price && pdf.price.toString().includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }
  
  // Payment modal
  if (showingPayment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase PDF</h2>
          
          <div className="mb-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                <FiFile className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-dark">{showingPayment.title}</h3>
                <p className="text-gray-600 mt-1">{showingPayment.description}</p>
                <p className="text-blue-600 font-medium mt-2">Price: ₹{showingPayment.price.toFixed(2)}</p>
              </div>
            </div>
            
            {paymentError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <FiLock className="h-4 w-4 mr-1" />
              <span>Payments are secure and processed by Cashfree</span>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => handlePayment(showingPayment)}
                disabled={paymentLoading}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="h-5 w-5 mr-2" />
                    Pay ₹{showingPayment.price.toFixed(2)}
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowingPayment(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Your PDF Documents</h1>
        <p className="text-gray-600 mt-2">Browse and download your PDF documents securely.</p>
      </div>

      {/* Search and filters */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
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

      {/* PDF list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPdfs.length > 0 ? (
          filteredPdfs.map((pdf) => (
            <div key={pdf._id} className="card hover:shadow-xl flex flex-col h-full relative">
              {/* Price tag for paid PDFs */}
              {!pdf.isFree && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  ₹{pdf.price.toFixed(2)}
                </div>
              )}
              
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <FiFile className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-dark">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {pdf.size} • {new Date(pdf.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiDownload className="h-3 w-3 mr-1" />
                    <span>{pdf.downloadCount || 0} downloads</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">{pdf.description}</p>
              
              {/* Purchase status for paid PDFs */}
              {!pdf.isFree && (
                <div className={`text-xs mb-3 px-3 py-1.5 rounded-full ${
                  purchasedPdfIds.includes(pdf._id) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                } inline-flex items-center self-start`}>
                  {purchasedPdfIds.includes(pdf._id) ? (
                    <>
                      <FiCheck className="h-3 w-3 mr-1" />
                      Purchased
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="h-3 w-3 mr-1" />
                      Requires Purchase
                    </>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-auto">
                <Link 
                  to={`/pdf/${pdf._id}`} 
                  className="flex items-center justify-center text-sm px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  Preview
                </Link>
                
                <button 
                  onClick={() => handleDownload(pdf)}
                  disabled={downloading[pdf._id]}
                  className={`flex items-center justify-center text-sm px-3 py-1.5 rounded flex-grow ${
                    !pdf.isFree && !purchasedPdfIds.includes(pdf._id)
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-primary text-white hover:bg-blue-600'
                  }`}
                >
                  {downloading[pdf._id] ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Downloading...
                    </>
                  ) : !pdf.isFree && !purchasedPdfIds.includes(pdf._id) ? (
                    <>
                      <FiShoppingCart className="h-4 w-4 mr-1" />
                      Purchase (₹{pdf.price.toFixed(2)})
                    </>
                  ) : (
                    <>
                      <FiDownload className="h-4 w-4 mr-1" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <FiInfo className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'No documents match your search criteria.' : 'You don\'t have any PDF documents yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Download notification */}
      <div 
        id="download-notification" 
        className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-lg hidden transition-opacity duration-300"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <FiCheck className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">Download completed successfully!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;