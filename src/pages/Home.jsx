import { Link } from 'react-router-dom';
import { FiDownload, FiLock, FiFileText, FiShield } from 'react-icons/fi';

const Home = ({ user }) => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-dark sm:mt-5 sm:text-5xl lg:mt-6">
                  <span className="block">Securely download</span>
                  <span className="block text-primary">PDF documents</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl">
                  Access your PDF files securely from anywhere. Our platform provides a safe environment for downloading important documents with Google authentication.
                </p>
                <div className="mt-8 sm:mt-10">
                  {user ? (
                    <Link to="/dashboard" className="btn btn-primary text-base sm:text-lg px-6 py-3">
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary text-base sm:text-lg px-6 py-3">
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative lg:inset-0">
                <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                  <img className="w-full" src="https://helpx.adobe.com/content/dam/help/en/acrobat/how-to/create-pdf-from-any-document/jcr_content/main-pars/image/create-pdf-from-any-document-intro-900x506.jpg" alt="PDF Downloader" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-dark sm:text-4xl">
              Why choose our PDF Downloader?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Everything you need to securely access and download your PDF documents
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="card hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <FiLock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">Secure Authentication</h3>
                <p className="text-gray-600">
                  We use Google authentication to ensure that only authorized users can access documents.
                </p>
              </div>

              <div className="card hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FiFileText className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">Document Preview</h3>
                <p className="text-gray-600">
                  Preview your PDF files before downloading to ensure you have the right document.
                </p>
              </div>

              <div className="card hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FiDownload className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">Easy Downloads</h3>
                <p className="text-gray-600">
                  Simple and fast downloads with just a single click, no complicated processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl">
            Sign in with your Google account and access your documents securely.
          </p>
          <div className="mt-8">
            {user ? (
              <Link to="/dashboard" className="btn bg-white text-primary hover:bg-gray-100 text-base px-6 py-3">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn bg-white text-primary hover:bg-gray-100 text-base px-6 py-3">
                Sign In Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;