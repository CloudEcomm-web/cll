// utils/accountManager.js
// Helper functions for managing multiple Lazada accounts

export const AccountManager = {
  // Get all stored accounts
  getAccounts() {
    const accounts = localStorage.getItem('lazada_accounts');
    return accounts ? JSON.parse(accounts) : [];
  },

  // Add a new account
  addAccount(accountData) {
    const accounts = this.getAccounts();
    const newAccount = {
      id: accountData.seller_id || accountData.account,
      seller_id: accountData.seller_id,
      account: accountData.account,
      country: accountData.country,
      access_token: accountData.access_token,
      refresh_token: accountData.refresh_token,
      expires_in: accountData.expires_in,
      token_expires_at: Date.now() + (accountData.expires_in * 1000),
      added_at: new Date().toISOString(),
    };

    // Check if account already exists
    const existingIndex = accounts.findIndex(acc => acc.id === newAccount.id);
    if (existingIndex >= 0) {
      // Update existing account
      accounts[existingIndex] = newAccount;
    } else {
      // Add new account
      accounts.push(newAccount);
    }

    localStorage.setItem('lazada_accounts', JSON.stringify(accounts));
    return newAccount;
  },

  // Remove an account
  removeAccount(accountId) {
    const accounts = this.getAccounts();
    const filtered = accounts.filter(acc => acc.id !== accountId);
    localStorage.setItem('lazada_accounts', JSON.stringify(filtered));
  },

  // Set active account
  setActiveAccount(accountId) {
    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.id === accountId);
    
    if (account) {
      localStorage.setItem('lazada_active_account', accountId);
      // Set the old localStorage keys for backward compatibility
      localStorage.setItem('lazada_access_token', account.access_token);
      localStorage.setItem('lazada_refresh_token', account.refresh_token);
      localStorage.setItem('lazada_country', account.country);
      localStorage.setItem('lazada_account', account.account);
      return account;
    }
    return null;
  },

  // Get active account ID
  getActiveAccountId() {
    return localStorage.getItem('lazada_active_account');
  },

  // Get active account data
  getActiveAccount() {
    const activeId = this.getActiveAccountId();
    if (!activeId) return null;
    
    const accounts = this.getAccounts();
    return accounts.find(acc => acc.id === activeId) || null;
  },

  // Check if token is expired
  isTokenExpired(account) {
    return Date.now() > account.token_expires_at;
  },

  // Clear all accounts
  clearAll() {
    localStorage.removeItem('lazada_accounts');
    localStorage.removeItem('lazada_active_account');
    localStorage.removeItem('lazada_access_token');
    localStorage.removeItem('lazada_refresh_token');
    localStorage.removeItem('lazada_country');
    localStorage.removeItem('lazada_account');
  }
};