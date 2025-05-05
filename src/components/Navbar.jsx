import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiFileText, FiSettings } from 'react-icons/fi';

const Navbar = ({ user, userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Token will be cleared in App.js when auth state changes
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FiFileText className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-dark">PDF Vault</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiHome className="mr-1" />
                Home
              </Link>
              
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FiFileText className="mr-1" />
                  Dashboard
                </Link>
              )}
              
              {/* Admin link - only shown to admin users */}
              {user && userRole === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FiSettings className="mr-1" />
                  Admin Panel
                </Link>
              )}
            </div>
            
            <div className="ml-4 flex items-center">
              {user ? (
                <div className="relative ml-3">
                  <div className="flex items-center">
                    {user.photoURL ? (
                      <img 
                        className="h-8 w-8 rounded-full border-2 border-gray-200"
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <FiUser />
                      </div>
                    )}
                    
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.displayName ? user.displayName.split(' ')[0] : 'User'}
                    </span>
                    
                    <button
                      onClick={handleSignOut}
                      className="ml-4 text-gray-500 hover:text-red-500 p-1 rounded-full flex items-center"
                    >
                      <FiLogOut />
                      <span className="ml-1 text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <FiHome className="mr-2" />
                Home
              </div>
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiFileText className="mr-2" />
                  Dashboard
                </div>
              </Link>
            )}
            
            {/* Admin link - only shown to admin users */}
            {user && userRole === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiSettings className="mr-2" />
                  Admin Panel
                </div>
              </Link>
            )}
          </div>
          
          {/* Mobile profile section */}
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                {user.photoURL ? (
                  <img
                    className="h-10 w-10 rounded-full border-2 border-gray-200"
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <FiUser />
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-red-500 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FiLogOut className="mr-2" />
                    Sign out
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;