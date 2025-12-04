import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountManager } from '../utils/AccountManager.jsx';

function Callback({ apiUrl }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    console.log('=== CALLBACK PAGE LOADED ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search params:', window.location.search);
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authorization error:', error);
      setStatus(`Authorization failed: ${error}`);
      setTimeout(() => navigate('/', { replace: true }), 3000);
      return;
    }

    if (!code) {
      console.error('No authorization code found');
      setStatus('No authorization code found');
      setTimeout(() => navigate('/', { replace: true }), 3000);
      return;
    }

    console.log('Authorization code received:', code);
    exchangeToken(code);
  }, [searchParams, navigate]);

  const exchangeToken = async (code) => {
    try {
      setStatus('Exchanging authorization code for access token...');
      console.log('Calling API:', `${apiUrl}/lazada/token`);
      
      const response = await fetch(`${apiUrl}/lazada/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      console.log('Token exchange response:', data);

      if (response.ok && data.success) {
        setStatus('Success! Saving credentials...');
        
        // Add account to multi-account storage
        const accountData = {
          seller_id: data.country_user_info?.[0]?.seller_id || data.account,
          account: data.account,
          country: data.country,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        };
        
        console.log('Adding account to AccountManager:', accountData);
        const newAccount = AccountManager.addAccount(accountData);
        AccountManager.setActiveAccount(newAccount.id);

        console.log('Account saved! Redirecting to orders...');
        setStatus('Redirecting to your orders...');

        // Redirect to orders
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 1000);
      } else {
        console.error('Token exchange failed:', data);
        setStatus(`Authentication failed: ${data.error || data.details || 'Unknown error'}`);
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    } catch (err) {
      console.error('Network error:', err);
      setStatus(`Network error: ${err.message}`);
      setTimeout(() => navigate('/', { replace: true }), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Lazada</h2>
        <p className="text-gray-600">{status}</p>
        <p className="text-xs text-gray-400 mt-4">This may take a few seconds...</p>
      </div>
    </div>
  );
}

export default Callback;