import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <FiAlertTriangle className="h-20 w-20 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold text-dark mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-dark mb-4">Page Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary flex items-center">
        <FiHome className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;