import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pdfjs, Document, Page } from 'react-pdf';
import { FiDownload, FiArrowLeft, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize } from 'react-icons/fi';
import { FiCheck } from 'react-icons/fi';
import { pdfApi } from '../services/api';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        
        // Get PDF details
        const response = await pdfApi.getById(id);
        setPdf(response.data.data);
        
        // For preview, we'll use the same download endpoint but create a temporary URL
        const downloadResponse = await pdfApi.download(id);
        const blob = new Blob([downloadResponse.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Failed to load PDF. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPdf();
    
    // Clean up URL when component unmounts
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      const response = await pdfApi.download(id);
      
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
      setDownloading(false);
    }
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-dark">{pdf.title}</h1>
          <p className="text-gray-600">{pdf.description}</p>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-4 md:mt-0 btn btn-primary flex items-center justify-center"
        >
          {downloading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Downloading...
            </>
          ) : (
            <>
              <FiDownload className="mr-2" />
              Download PDF
            </>
          )}
        </button>
      </div>
      
      {/* PDF Controls */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-3 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`p-1 rounded ${pageNumber <= 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          
          <span className="text-sm">
            Page {pageNumber} of {numPages || '?'}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className={`p-1 rounded ${!numPages || pageNumber >= numPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <FiChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <button
            onClick={zoomOut}
            className="p-1 rounded text-gray-700 hover:bg-gray-100"
            disabled={scale <= 0.5}
          >
            <FiMinimize className="h-5 w-5" />
          </button>
          
          <span className="text-sm whitespace-nowrap">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1 rounded text-gray-700 hover:bg-gray-100"
            disabled={scale >= 2.5}
          >
            <FiMaximize className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* PDF Document */}
      <div className="bg-gray-200 rounded-lg p-4 overflow-auto max-h-[70vh] flex justify-center">
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error('Error loading PDF:', error);
              setError('Failed to load the PDF document.');
            }}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">No PDF document available</div>
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

export default PDFViewer;