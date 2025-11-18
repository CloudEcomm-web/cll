import { useState, useEffect } from 'react';

function OrderItems({ apiUrl }) {
  const [accessToken, setAccessToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have a stored access token
    const token = localStorage.getItem('lazada_access_token');
    if (token) {
      setAccessToken(token);
      fetchOrders(token);
    }
  }, []);

  const fetchOrders = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/lazada/orders?limit=20&offset=0`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.code === '0') {
        setOrders(data.data?.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    setLoading(true);
    setError(null);
    setSelectedOrder(orderId);

    try {
      const response = await fetch(`${apiUrl}/lazada/order/${orderId}/items`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok && (data.code === '0' || data.code === 0)) {
        setOrderItems(data.data || []);
      } else {
        setError(data.details || data.message || 'Failed to fetch order items');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMultipleOrderItems = async () => {
    if (orders.length === 0) {
      setError('No orders available');
      return;
    }

    setLoading(true);
    setError(null);

    // Get first 5 order IDs
    const orderIds = orders.slice(0, 5).map(order => order.order_id);

    try {
      const response = await fetch(`${apiUrl}/lazada/orders/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ orderIds })
      });

      const data = await response.json();

      if (response.ok && (data.code === '0' || data.code === 0)) {
        setOrderItems(data.data || []);
        setSelectedOrder('multiple');
      } else {
        setError(data.details || data.message || 'Failed to fetch multiple order items');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Not Authenticated</h2>
          <p className="text-gray-600 mb-4">Please authenticate with Lazada first</p>
          <a href="/" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Lazada Order Items</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Orders</h2>
              <button
                onClick={fetchMultipleOrderItems}
                disabled={loading || orders.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Get Items (First 5)
              </button>
            </div>

            {loading && orders.length === 0 ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className={`p-4 border rounded cursor-pointer hover:bg-blue-50 transition ${
                      selectedOrder === order.order_id ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    onClick={() => fetchOrderItems(order.order_id)}
                  >
                    <div className="font-semibold">Order #{order.order_number}</div>
                    <div className="text-sm text-gray-600">
                      ID: {order.order_id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: <span className="font-medium">{order.statuses?.[0]}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Price: {order.price} {order.currency || 'PHP'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>

            {loading && selectedOrder ? (
              <p className="text-gray-500">Loading items...</p>
            ) : !selectedOrder ? (
              <p className="text-gray-500">Select an order to view items</p>
            ) : orderItems.length === 0 ? (
              <p className="text-gray-500">No items found</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orderItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      SKU: {item.sku}
                    </div>
                    <div className="text-sm text-gray-600">
                      Order Item ID: {item.order_item_id}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">
                        Quantity: <span className="font-medium">{item.quantity || 1}</span>
                      </span>
                      <span className="text-sm font-semibold">
                        {item.paid_price} {item.currency || 'PHP'}
                      </span>
                    </div>
                    {item.variation && (
                      <div className="text-xs text-gray-500 mt-1">
                        Variation: {item.variation}
                      </div>
                    )}
                    {item.status && (
                      <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {item.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-2xl font-bold">{orderItems.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Quantity</div>
                <div className="text-2xl font-bold">
                  {orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="text-2xl font-bold">
                  {orderItems.reduce((sum, item) => sum + parseFloat(item.paid_price || 0), 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Orders Selected</div>
                <div className="text-2xl font-bold">
                  {selectedOrder === 'multiple' ? '5' : '1'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderItems;