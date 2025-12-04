import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountManager } from '../utils/AccountManager';

function Ffr({ apiUrl }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [rawResponses, setRawResponses] = useState({});

  useEffect(() => {
    const allAccounts = AccountManager.getAccounts();
    
    if (allAccounts.length === 0) {
      navigate('/', { replace: true });
      return;
    }
    
    setAccounts(allAccounts);
    fetchAllAccountsPerformance(allAccounts);
  }, [navigate]);

  const fetchAllAccountsPerformance = async (accountsList) => {
    setLoading(true);
    setError(null);
    setPerformanceData([]);
    setRawResponses({});
    
    // Fetch all accounts in parallel for faster loading
    const promises = accountsList.map(account => 
      fetchAccountPerformance(account)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      
      const allPerformance = [];
      const allRawResponses = {};
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const account = accountsList[index];
          allPerformance.push({
            account_id: account.id,
            account_name: account.account,
            account_country: account.country,
            ...result.value.parsed
          });
          
          // Collect raw responses
          if (result.value.rawResponse) {
            allRawResponses[account.id] = result.value.rawResponse;
          }
        }
      });
      
      // Update state once with all data
      setPerformanceData(allPerformance);
      setRawResponses(allRawResponses);
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountPerformance = async (account) => {
    try {
      const response = await fetch(`${apiUrl}/lazada/seller/policy`, {
        headers: {
          'Authorization': `Bearer ${account.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && (data.code === '0' || data.code === 0)) {
        let ffrRate = 'N/A';
        
        // FFR is nested inside the "logistic" policy's children array
        if (data.data && data.data.policyTree && Array.isArray(data.data.policyTree)) {
          // First find the logistic policy
          const logisticPolicy = data.data.policyTree.find(policy => 
            policy.uniqueKey === 'logistic'
          );
          
          if (logisticPolicy && logisticPolicy.children && Array.isArray(logisticPolicy.children)) {
            // Now find the FFR policy inside the children
            const ffrPolicy = logisticPolicy.children.find(child => 
              child.uniqueKey === 'fast_fulfilment'
            );
            
            if (ffrPolicy && ffrPolicy.score && ffrPolicy.score !== '-') {
              // Remove the % sign from the score (e.g., "95.87%" -> "95.87")
              ffrRate = ffrPolicy.score.toString().replace('%', '');
            }
          }
        }
        
        return { 
          parsed: { ffr: ffrRate },
          rawResponse: {
            account_name: account.account,
            account_country: account.country,
            status: response.status,
            statusText: response.statusText,
            headers: {
              'content-type': response.headers.get('content-type'),
              'date': response.headers.get('date')
            },
            fullResponse: data
          }
        };
      } else {
        return { 
          parsed: { ffr: 'Error' },
          rawResponse: {
            account_name: account.account,
            account_country: account.country,
            status: response.status,
            statusText: response.statusText,
            headers: {},
            fullResponse: data
          }
        };
      }
    } catch (err) {
      console.error(`Error fetching policy for ${account.account}:`, err);
      return { 
        parsed: { ffr: 'Error' },
        rawResponse: {
          account_name: account.account,
          account_country: account.country,
          status: 'error',
          statusText: err.message,
          headers: {},
          fullResponse: { error: err.message }
        }
      };
    }
  };

  const handleRefresh = () => {
    setPerformanceData([]);
    setRawResponses({});
    fetchAllAccountsPerformance(accounts);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fast Fulfilment Rate (FFR)</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showRawData ? 'Hide' : 'Show'} Raw API Response
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Raw API Response Display */}
      {showRawData && Object.keys(rawResponses).length > 0 && (
        <div className="mb-6 bg-gray-900 text-green-400 rounded-lg p-6 overflow-auto max-h-[600px]">
          <h2 className="text-xl font-bold mb-4 text-white">Complete API Responses (All Data)</h2>
          {Object.entries(rawResponses).map(([accountId, data]) => (
            <div key={accountId} className="mb-8">
              <div className="bg-gray-800 p-3 rounded mb-2">
                <h3 className="text-lg font-semibold text-yellow-400">
                  Account: {data.account_name} ({data.account_country})
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  HTTP Status: {data.status} {data.statusText}
                </p>
              </div>
              <div className="bg-black p-4 rounded">
                <p className="text-cyan-400 mb-2 font-mono text-xs">COMPLETE RESPONSE BODY:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(data.fullResponse, null, 2)}
                </pre>
              </div>
              <div className="border-t border-gray-700 my-6"></div>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-blue-900 rounded">
            <p className="text-blue-200 text-sm">
              💡 <strong>Tip:</strong> Check your browser console (F12) for the same data in a more readable format. 
              You can also right-click on the JSON above and copy it.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Account Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Fast Fulfilment Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && performanceData.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading performance data...</p>
                  </div>
                </td>
              </tr>
            ) : performanceData.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                  No performance data available
                </td>
              </tr>
            ) : (
              performanceData.map((data) => (
                <tr key={data.account_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{data.account_name}</div>
                      <div className="text-sm text-gray-500 uppercase">{data.account_country}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {data.ffr !== 'N/A' && data.ffr !== 'Error' ? `${data.ffr}%` : data.ffr}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ffr;