import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from './firebase/config';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PDFViewer from './pages/PDFViewer';
import NotFound from './pages/NotFound';
import AdminPanel from './components/AdminPanel';
import PaymentSuccess from './pages/PaymentSuccess';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
const API_URL = import.meta.env.VITE_API_URL || 'https://pdf-vault-backend.onrender.com/api';
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Get the user token for API calls
          const token = await currentUser.getIdToken();
          
          // Store the token in localStorage (consider more secure options in production)
          localStorage.setItem('authToken', token);

          console.log('User token:', token);
          
          // Fetch user role from your backend when user logs in
          // This is a simplified example. In a real app, you would use your userApi.getProfile()
          const response = await fetch(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.data.role);
          }
        } catch (error) {
          console.error('Error setting up authenticated user:', error);
        }
      } else {
        // Clear token on logout
        localStorage.removeItem('authToken');
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up axios interceptor to refresh token when needed
  useEffect(() => {
    // Set up token refresh mechanism
    if (user) {
      const refreshTokenInterval = setInterval(async () => {
        try {
          const newToken = await user.getIdToken(true); // Force refresh
          localStorage.setItem('authToken', newToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }, 55 * 60 * 1000); // Refresh every 55 minutes (Firebase tokens typically expire after 1 hour)
      
      return () => clearInterval(refreshTokenInterval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} userRole={userRole} />
        <main className="flex-grow">
          <Routes>
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/pdf/:id" 
              element={user ? <PDFViewer user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={
                user && userRole === 'admin' 
                  ? <AdminPanel user={user} /> 
                  : <Navigate to="/dashboard" />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;