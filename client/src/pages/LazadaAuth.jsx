import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LazadaAuth({ apiUrl }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we got the authorization code from Lazada
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    
    if (errorParam) {
      setError(`Authorization failed: ${errorParam}`);
      return;
    }

    if (code) {
      console.log('Received authorization code, exchanging for token...');
      exchangeCodeForToken(code);
    }
  }, [searchParams]);

  const exchangeCodeForToken = async (code) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Sending code to backend...');
      const response = await fetch(`${apiUrl}/lazada/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log('Token exchange response:', data);

      if (response.ok && data.success) {
        // Store tokens securely
        localStorage.setItem('lazada_access_token', data.access_token);
        localStorage.setItem('lazada_refresh_token', data.refresh_token);
        localStorage.setItem('lazada_expires_in', data.expires_in);
        localStorage.setItem('lazada_country', data.country);
        localStorage.setItem('lazada_account', data.account);
        
        // Store expiration time
        const expirationTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('lazada_token_expires_at', expirationTime);

        setSuccess(true);
        
        // Redirect to orders page immediately - use navigate with replace
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 1500);
      } else {
        setError(data.details || data.error || 'Failed to authenticate');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Getting authorization URL...');
      const response = await fetch(`${apiUrl}/lazada/auth-url`);
      const data = await response.json();
      
      console.log('Auth URL received:', data.authUrl);
      console.log('Redirect URI:', data.redirectUri);
      
      // Redirect to Lazada authorization page
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Failed to get authorization URL:', err);
      setError('Failed to get authorization URL: ' + err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all Lazada tokens
    localStorage.removeItem('lazada_access_token');
    localStorage.removeItem('lazada_refresh_token');
    localStorage.removeItem('lazada_expires_in');
    localStorage.removeItem('lazada_country');
    localStorage.removeItem('lazada_account');
    localStorage.removeItem('lazada_token_expires_at');
    
    setSuccess(false);
    setError(null);
  };

  // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem('lazada_access_token');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lazada Integration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Lazada seller account
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">
                Authentication successful. Taking you to your orders...
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Processing...</p>
            </div>
          ) : isAuthenticated && !success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">✓ Already Connected</p>
                <p className="text-sm text-green-700">
                  Account: {localStorage.getItem('lazada_account')}
                </p>
                <p className="text-sm text-green-700">
                  Country: {localStorage.getItem('lazada_country')?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                View Orders
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>You'll be redirected to Lazada</li>
                  <li>Select your country and log in</li>
                  <li>Authorize this application</li>
                  <li>You'll be redirected back here</li>
                </ol>
              </div>

              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect to Lazada
              </button>

              <p className="text-xs text-center text-gray-500">
                Callback URL: https://renzparagas123.github.io/cll/callback
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by Lazada Open Platform API
          </p>
        </div>
      </div>
    </div>
  );
}

export default LazadaAuth;