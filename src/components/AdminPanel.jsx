// src/components/AdminPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Users, DollarSign, Upload, X, Edit, Trash, Plus, Check, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminPanel = ({ user }) => {
  // State variables
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pdfs, setPdfs] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [downloadStats, setDownloadStats] = useState(null);
  
  // PDF upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfFormData, setPdfFormData] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: false,
    tags: ''
  });
  
  // PDF edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPdf, setEditingPdf] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: false,
    tags: ''
  });
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPdfId, setDeletingPdfId] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Get the Firebase token
  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch all PDFs
  const fetchPdfs = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/pdfs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPdfs(response.data.data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch revenue statistics
  const fetchRevenueStats = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/admin/stats/revenue`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRevenueData(response.data.data);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  };

  // Fetch download statistics
  const fetchDownloadStats = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/admin/stats/downloads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDownloadStats(response.data.data);
    } catch (error) {
      console.error('Error fetching download stats:', error);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    setLoading(true);
    
    const loadData = async () => {
      switch (activeTab) {
        case 'dashboard':
          await fetchDashboardStats();
          break;
        case 'pdfs':
          await fetchPdfs();
          break;
        case 'users':
          await fetchUsers();
          break;
        case 'revenue':
          await fetchRevenueStats();
          break;
        case 'downloads':
          await fetchDownloadStats();
          break;
        default:
          break;
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeTab]);

  // Set up drag and drop event listeners
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    
    if (!dropArea) return;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('bg-gray-100');
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('bg-gray-100');
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('bg-gray-100');
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFileSelectInternal(file);
      }
    };
    
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    return () => {
      if (dropArea) {
        dropArea.removeEventListener('dragover', handleDragOver);
        dropArea.removeEventListener('dragleave', handleDragLeave);
        dropArea.removeEventListener('drop', handleDrop);
      }
    };
  }, [showUploadModal]);

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = await getToken();
      await axios.put(`${API_URL}/admin/users/${userId}/role`, 
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Internal file validation helper
  const handleFileSelectInternal = (file) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF file');
      setSelectedFile(null);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size exceeds 10MB limit');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setUploadError(null);
  };

  // Handle PDF file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelectInternal(file);
    }
  };

  // Handle PDF form input changes
  const handlePdfFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPdfFormData({
      ...pdfFormData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  // Upload PDF
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    try {
      setUploadLoading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('pdfFile', selectedFile);
      formData.append('title', pdfFormData.title);
      formData.append('description', pdfFormData.description);
      formData.append('price', pdfFormData.isFree ? 0 : pdfFormData.price);
      formData.append('isFree', pdfFormData.isFree);
      
      if (pdfFormData.tags) {
        formData.append('tags', pdfFormData.tags);
      }
      
      const token = await getToken();
      await axios.post(`${API_URL}/pdfs`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Success
      setUploadSuccess(true);
      
      // Reset form
      setPdfFormData({
        title: '',
        description: '',
        price: 0,
        isFree: false,
        tags: ''
      });
      setSelectedFile(null);
      
      // Refresh PDFs list
      fetchPdfs();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete PDF confirmation
  const confirmDeletePdf = (pdfId) => {
    setDeletingPdfId(pdfId);
    setShowDeleteModal(true);
  };

  // Delete PDF
  const handleDeletePdf = async () => {
    try {
      const token = await getToken();
      // Fix: Use axios.delete instead of relying on .remove() method
      await axios.delete(`${API_URL}/pdfs/${deletingPdfId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Close modal
      setShowDeleteModal(false);
      
      // Refresh PDFs list
      fetchPdfs();
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('Failed to delete PDF. Please try again.');
    }
  };

  // Open edit modal
  const openEditModal = (pdf) => {
    setEditingPdf(pdf);
    setEditFormData({
      title: pdf.title,
      description: pdf.description,
      price: pdf.price,
      isFree: pdf.isFree,
      tags: pdf.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  // Update PDF
  const handleUpdatePdf = async (e) => {
    e.preventDefault();
    
    try {
      const token = await getToken();
      
      // Prepare updated data
      const updatedData = {
        title: editFormData.title,
        description: editFormData.description,
        price: editFormData.isFree ? 0 : editFormData.price,
        isFree: editFormData.isFree
      };
      
      if (editFormData.tags) {
        updatedData.tags = editFormData.tags.split(',').map(tag => tag.trim());
      }
      
      await axios.put(`${API_URL}/admin/pdfs/${editingPdf._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh PDFs list
      fetchPdfs();
      
      // Close modal
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating PDF:', error);
      alert('Failed to update PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-b-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white h-screen fixed">
          <div className="p-4">
            <div className="py-4 mb-6 flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-400" />
              <h2 className="text-xl font-bold ml-2">Admin Portal</h2>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <span className="mr-2">📊</span> Dashboard
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'pdfs' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('pdfs')}
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDFs
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="w-4 h-4 mr-2" /> Users
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('revenue')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" /> Revenue
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === 'downloads' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('downloads')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Downloads
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="ml-64 flex-1 p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-slate-800">Dashboard Overview</h1>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-b-4 border-blue-500">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-slate-700">Total Users</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
                  <p className="text-sm text-slate-500 mt-2">Active accounts</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-b-4 border-green-500">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-slate-700">PDF Documents</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalPdfs}</p>
                  <p className="text-sm text-slate-500 mt-2">Available files</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-b-4 border-purple-500">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Download className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-slate-700">Downloads</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalDownloads}</p>
                  <p className="text-sm text-slate-500 mt-2">Total downloads</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-b-4 border-yellow-500">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-slate-700">Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-slate-500 mt-2">Total earnings</p>
                </div>
              </div>
              
              {/* Top Downloaded PDFs */}
              <div className="bg-white p-6 rounded-xl shadow-lg mb-8 overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">Top Downloaded PDFs</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Title</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.topPdfs.map((pdf, index) => (
                        <tr key={pdf._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pdf.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pdf.description.substring(0, 50)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {pdf.downloadCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pdf.price > 0 ? (
                              <span className="font-medium text-green-600">${pdf.price.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-500">Free</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Recent Downloads */}
              <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">Recent Downloads</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">User</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentDownloads.map((download, index) => (
                        <tr key={download._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {download.user.photoURL ? (
                                <img className="h-8 w-8 rounded-full mr-3" src={download.user.photoURL} alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                  {download.user.displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">{download.user.displayName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{download.pdf?.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(download.downloadedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* PDFs Management */}
          {activeTab === 'pdfs' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">PDF Documents</h1>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Upload New PDF
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Title</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pdfs.map((pdf, index) => (
                        <tr key={pdf._id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{pdf.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{pdf.description.substring(0, 50)}...</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {pdf.downloadCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {pdf.price > 0 ? (
                              <span className="font-medium text-green-600">${pdf.price.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-500">Free</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {pdf.isFree ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Free
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                Paid
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium flex space-x-3">
                            <button 
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              onClick={() => openEditModal(pdf)}
                              title="Edit PDF"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 transition-colors"
                              onClick={() => confirmDeletePdf(pdf._id)}
                              title="Delete PDF"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Users Management */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-slate-800">User Management</h1>
              
              <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">User</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr key={user._id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.photoURL ? (
                                <img className="h-10 w-10 rounded-full mr-3 border-2 border-blue-100" src={user.photoURL} alt={user.displayName} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-semibold">
                                  {user.displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              className="mr-2 border border-gray-300 rounded px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button className="text-red-600 hover:text-red-900 transition-colors">
                              <Trash className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Revenue Statistics */}
          {activeTab === 'revenue' && revenueData && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-slate-800">Revenue Analytics</h1>
              
              {/* Overview */}
              <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-6 text-slate-800 border-b border-gray-200 pb-3">Revenue Overview</h2>
                <div className="text-4xl font-bold text-slate-800 mb-6 flex items-end">
                  <span className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600 mr-2" />
                    {revenueData.totalRevenue.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 ml-3 pb-1">total earnings</span>
                </div>
                
                {/* Monthly Revenue Chart */}
                <h3 className="text-lg font-semibold mb-4 text-slate-700">Monthly Revenue</h3>
                <div className="h-80 bg-white p-2 rounded-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.monthlyRevenue}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Revenue by PDF */}
              <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                <h2 className="text-xl font-semibold mb-6 text-slate-800 border-b border-gray-200 pb-3">Revenue by PDF Document</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Document</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.revenueByPdf.map((item, index) => (
                        <tr key={item._id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{item.purchases}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-green-600">${item.revenue.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Download Statistics */}
          {activeTab === 'downloads' && downloadStats && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-slate-800">Download Analytics</h1>
              
              <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                <h2 className="text-xl font-semibold mb-6 text-slate-800 border-b border-gray-200 pb-3">PDF Download Statistics</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Document Title</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Downloads</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Last Downloaded</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {downloadStats.map((item, index) => (
                        <tr key={item._id} className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'} style={{transition: 'all 0.2s'}}>
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.description?.substring(0, 50)}...</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.totalDownloads}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(item.lastDownloaded).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload PDF Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Upload New PDF</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {uploadSuccess ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">PDF uploaded successfully!</p>
                    <p className="text-xs text-green-700 mt-1">Redirecting to PDF list...</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePdfUpload}>
                {uploadError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{uploadError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File <span className="text-red-500">*</span>
                  </label>
                  <div 
                    ref={dropAreaRef}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors duration-200"
                  >
                    <div className="space-y-1 text-center">
                      <div className="flex flex-col items-center">
                        {selectedFile ? (
                          <>
                            <FileText className="mx-auto h-12 w-12 text-blue-500" />
                            <p className="text-sm font-medium text-gray-700 mt-2">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-600 mt-2">
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline"
                                onClick={() => fileInputRef.current.click()}
                              >
                                Select a file
                              </button>{' '}
                              or drag and drop
                            </p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">PDF files only (max. 10MB)</p>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-5">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                    value={pdfFormData.title}
                    onChange={handlePdfFormChange}
                    placeholder="Enter document title"
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                    value={pdfFormData.description}
                    onChange={handlePdfFormChange}
                    placeholder="Enter document description"
                  ></textarea>
                </div>
                
                <div className="flex items-center mb-5">
                  <input
                    type="checkbox"
                    name="isFree"
                    id="isFree"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={pdfFormData.isFree}
                    onChange={handlePdfFormChange}
                  />
                  <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700 font-medium">
                    Free Download
                  </label>
                </div>
                
                {!pdfFormData.isFree && (
                  <div className="mb-5">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0.01"
                        step="0.01"
                        required={!pdfFormData.isFree}
                        className="pl-7 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                        value={pdfFormData.price}
                        onChange={handlePdfFormChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-5">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                    value={pdfFormData.tags}
                    onChange={handlePdfFormChange}
                    placeholder="e.g. report, finance, guide"
                  />
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploadLoading || !selectedFile || !pdfFormData.title || !pdfFormData.description || (!pdfFormData.isFree && !pdfFormData.price)}
                  >
                    {uploadLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      'Upload PDF'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit PDF Modal */}
      {showEditModal && editingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Edit PDF</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePdf}>
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                ></textarea>
              </div>
              
              <div className="flex items-center mb-5">
                <input
                  type="checkbox"
                  name="isFree"
                  id="isFree"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={editFormData.isFree}
                  onChange={handleEditFormChange}
                />
                <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700 font-medium">
                  Free Download
                </label>
              </div>
              
              {!editFormData.isFree && (
                <div className="mb-5">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0.01"
                      step="0.01"
                      required={!editFormData.isFree}
                      className="pl-7 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
              )}
              
              <div className="mb-5">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5"
                  value={editFormData.tags}
                  onChange={handleEditFormChange}
                  placeholder="e.g. report, finance, guide"
                />
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Update PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete PDF</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this PDF? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                onClick={handleDeletePdf}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;