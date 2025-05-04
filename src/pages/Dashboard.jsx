import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { 
  FiDownload, FiFile, FiSearch, FiCheck, FiEye, FiInfo, FiAlertCircle 
} from 'react-icons/fi';

const Dashboard = ({ user }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState({});

  // Sample PDF data (replace with actual Firebase fetching)
  const samplePdfs = [
    {
      id: '1',
      title: 'User Guide',
      description: 'Comprehensive user guide for the application',
      size: '2.4 MB',
      createdAt: new Date('2024-03-15'),
      downloadCount: 45,
      path: 'pdfs/user-guide.pdf',
      thumbnail: 'https://via.placeholder.com/100x140'
    },
    {
      id: '2',
      title: 'Technical Documentation',
      description: 'Technical specifications and API documentation',
      size: '3.8 MB',
      createdAt: new Date('2024-04-10'),
      downloadCount: 23,
      path: 'pdfs/technical-docs.pdf',
      thumbnail: 'https://via.placeholder.com/100x140'
    },
    {
      id: '3',
      title: 'Monthly Report - April 2024',
      description: 'Financial and operational report for April 2024',
      size: '1.2 MB',
      createdAt: new Date('2024-05-01'),
      downloadCount: 12,
      path: 'pdfs/april-report.pdf',
      thumbnail: 'https://via.placeholder.com/100x140'
    },
    {
      id: '4',
      title: 'Product Brochure',
      description: 'Marketing brochure with product information',
      size: '5.7 MB',
      createdAt: new Date('2024-04-22'),
      downloadCount: 67,
      path: 'pdfs/brochure.pdf',
      thumbnail: 'https://via.placeholder.com/100x140'
    },
    {
      id: '5',
      title: 'Research Paper',
      description: 'Academic research paper on modern technology',
      size: '2.9 MB',
      createdAt: new Date('2024-03-27'),
      downloadCount: 31,
      path: 'pdfs/research.pdf',
      thumbnail: 'https://via.placeholder.com/100x140'
    },
  ];

  // Fetch PDFs from Firestore
  useEffect(() => {
    // In a real app, fetch from Firebase
    setTimeout(() => {
      setPdfs(samplePdfs);
      setLoading(false);
    }, 1000);
    
    // Actual Firebase implementation would be:
    /*
    const fetchPdfs = async () => {
      try {
        const pdfCollection = collection(db, 'pdfs');
        const pdfSnapshot = await getDocs(pdfCollection);
        const pdfList = pdfSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPdfs(pdfList);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
        setError('Failed to load PDFs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPdfs();
    */
  }, []);

  const handleDownload = async (pdf) => {
    setDownloading(prev => ({ ...prev, [pdf.id]: true }));
    
    // Simulate download delay
    setTimeout(() => {
      setDownloading(prev => ({ ...prev, [pdf.id]: false }));
      
      // Show success notification
      const notification = document.getElementById('download-notification');
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }, 1500);
    
    // Actual Firebase implementation would be:
    /*
    try {
      setDownloading(prev => ({ ...prev, [pdf.id]: true }));
      const fileRef = ref(storage, pdf.path);
      const url = await getDownloadURL(fileRef);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.title + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update download count in Firestore
      // ...
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [pdf.id]: false }));
    }
    */
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
            <div key={pdf.id} className="card hover:shadow-xl flex flex-col h-full">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <FiFile className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-dark">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{pdf.size} • {pdf.createdAt.toLocaleDateString()}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiDownload className="h-3 w-3 mr-1" />
                    <span>{pdf.downloadCount} downloads</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-grow">{pdf.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                <Link 
                  to={`/pdf/${pdf.id}`} 
                  className="flex items-center justify-center text-sm px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  Preview
                </Link>
                
                <button 
                  onClick={() => handleDownload(pdf)}
                  disabled={downloading[pdf.id]}
                  className="flex items-center justify-center text-sm px-3 py-1.5 rounded bg-primary text-white hover:bg-blue-600 flex-grow"
                >
                  {downloading[pdf.id] ? (
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