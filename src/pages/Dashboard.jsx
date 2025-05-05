import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiFile, FiSearch, FiCheck, FiEye, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { pdfApi } from '../services/api';

const Dashboard = ({ user }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState({});

  // Fetch PDFs from backend API
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        const response = await pdfApi.getAll();
        setPdfs(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
        setError('Failed to load PDFs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPdfs();
  }, []);

  const handleDownload = async (pdf) => {
    try {
      setDownloading(prev => ({ ...prev, [pdf._id]: true }));
      
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
      
      // Show success notification
      const notification = document.getElementById('download-notification');
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [pdf._id]: false }));
    }
  };

  // Filter PDFs based on search term
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
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
            <div key={pdf._id} className="card hover:shadow-xl flex flex-col h-full">
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
                    <span>{pdf.downloadCount} downloads</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">{pdf.description}</p>
              
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
                  className="flex items-center justify-center text-sm px-3 py-1.5 rounded bg-primary text-white hover:bg-blue-600 flex-grow"
                >
                  {downloading[pdf._id] ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Downloading...
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