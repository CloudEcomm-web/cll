import crypto from 'crypto';
import axios from 'axios';

class LazadaAuth {
  constructor(appKey, appSecret, apiUrl) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.apiUrl = apiUrl;
  }

  // Generate signature for API requests
  generateSignature(apiPath, params) {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}${params[key]}`)
      .join('');

    // Create signature string: API path + sorted parameters
    const signString = `${apiPath}${sortedParams}`;

    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.appSecret)
      .update(signString)
      .digest('hex')
      .toUpperCase();

    return signature;
  }

  // Get current timestamp in milliseconds
  getTimestamp() {
    return Date.now();
  }

  // Create access token using authorization code
  async createAccessToken(code) {
    const apiPath = '/auth/token/create';
    const timestamp = this.getTimestamp();

    const params = {
      app_key: this.appKey,
      timestamp: timestamp.toString(),
      sign_method: 'sha256',
      code: code,
    };

    const sign = this.generateSignature(apiPath, params);
    params.sign = sign;

    try {
      const response = await axios.post(
        `${this.apiUrl}${apiPath}`,
        null,
        { params }
      );

      console.log('Token creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lazada Token Creation Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const apiPath = '/auth/token/refresh';
    const timestamp = this.getTimestamp();

    const params = {
      app_key: this.appKey,
      timestamp: timestamp.toString(),
      sign_method: 'sha256',
      refresh_token: refreshToken,
    };

    const sign = this.generateSignature(apiPath, params);
    params.sign = sign;

    try {
      const response = await axios.post(
        `${this.apiUrl}${apiPath}`,
        null,
        { params }
      );

      console.log('Token refresh response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lazada Token Refresh Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Make authenticated API request (Simplified - GET only for now)
  async makeRequest(apiPath, accessToken, additionalParams = {}, method = 'GET') {
    const timestamp = this.getTimestamp();

    // Combine ALL parameters for signature and request
    const allParams = {
      app_key: this.appKey,
      timestamp: timestamp.toString(),
      sign_method: 'sha256',
      access_token: accessToken,
      ...additionalParams
    };

    console.log('\n🔧 LAZADA AUTH - makeRequest');
    console.log('   Method:', method);
    console.log('   API Path:', apiPath);
    
    console.log('\n   All Parameters (for signature):');
    Object.keys(allParams).forEach(key => {
      const value = key === 'access_token' 
        ? allParams[key]?.substring(0, 20) + '...'
        : allParams[key];
      console.log(`   ├─ ${key}:`, value);
    });

    // Generate signature with ALL parameters
    const sign = this.generateSignature(apiPath, allParams);
    allParams.sign = sign;
    
    console.log('   └─ sign:', sign);
    console.log('\n   Full URL:', `${this.apiUrl}${apiPath}`);
    console.log('   📡 Making GET request with all params in query string...');

    try {
      const response = await axios.get(`${this.apiUrl}${apiPath}`, { 
        params: allParams,
        timeout: 30000 
      });
      
      console.log('   ✅ HTTP Status:', response.status);
      console.log('   ✅ Response Code:', response.data?.code);
      
      if (response.data?.code !== '0' && response.data?.code !== 0) {
        console.log('   ⚠️  API returned non-zero code:', response.data?.message);
      }
      
      return response.data;
    } catch (error) {
      console.error('\n   ❌ Request Failed:');
      console.error('   ├─ Error Message:', error.message);
      console.error('   ├─ HTTP Status:', error.response?.status);
      console.error('   ├─ Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   └─ Full URL:', error.config?.url);
      throw error;
    }
  }

  // Make authenticated API request (POST) - kept for backward compatibility
  async makePostRequest(apiPath, accessToken, bodyParams = {}) {
    return this.makeRequest(apiPath, accessToken, bodyParams, 'POST');
  }

  // Get Order Items (specific implementation)
  async getOrderItems(accessToken, orderId) {
    return this.makeRequest(
      '/order/items/get',
      accessToken,
      { order_id: orderId.toString() },
      'GET'
    );
  }

  // Get Multiple Order Items
  async getMultipleOrderItems(accessToken, orderIds) {
    const orderIdsJson = JSON.stringify(orderIds);
    return this.makeRequest(
      '/orders/items/get',
      accessToken,
      { order_ids: orderIdsJson },
      'GET'
    );
  }
}

export default LazadaAuth;