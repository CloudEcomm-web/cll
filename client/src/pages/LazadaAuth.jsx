import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountManager } from '../utils/AccountManager.jsx';

function LazadaAuth({ apiUrl }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/lazada/auth-url`);
      const data = await response.json();
      
      if (response.ok && data.authUrl) {
        // Redirect to Lazada
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get authorization URL');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  // Check if already authenticated
  const accounts = AccountManager.getAccounts();
  const isAuthenticated = accounts.length > 0;

  if (isAuthenticated) {
    // Already have accounts, show option to add more or go to orders
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">You have {accounts.length} account(s) connected</p>
          </div>

          <div className="space-y-4 mb-6">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {account.account?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.account}</p>
                  <p className="text-xs text-gray-500 uppercase">{account.country}</p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error: </strong>{error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to Orders
            </button>

            {accounts.length < 5 && (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Add Another Account'}
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout from all accounts?')) {
                  AccountManager.clearAll();
                  window.location.reload();
                }
              }}
              className="w-full bg-white text-red-600 border border-red-300 py-3 px-4 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              Logout All Accounts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lazada Integration</h1>
          <p className="text-gray-600">Connect your Lazada seller account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong>{error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Setup:</h3>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Connect to Lazada"</li>
            <li>Log in to your Lazada seller account</li>
            <li>Authorize the application</li>
            <li>You'll be taken directly to your orders</li>
          </ol>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect to Lazada
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Secure OAuth 2.0 authentication
        </p>
      </div>
    </div>
  );
}

export default LazadaAuth;