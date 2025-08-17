import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transactionsRes, integrationsRes, monthlyRes, categoryRes] = await Promise.all([
        axios.get(`${API}/summary`),
        axios.get(`${API}/transactions`),
        axios.get(`${API}/integrations`),
        axios.get(`${API}/analytics/monthly`),
        axios.get(`${API}/analytics/categories`)
      ]);

      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
      setIntegrations(integrationsRes.data);
      setMonthlyAnalytics(monthlyRes.data.monthly_data);
      setCategoryAnalytics(categoryRes.data.category_data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformTransactions = async (platformId) => {
    try {
      const response = await axios.get(`${API}/transactions?platform=${platformId}`);
      setTransactions(response.data);
      setSelectedPlatform(platformId);
    } catch (error) {
      console.error('Error fetching platform transactions:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlatformIcon = (platformId) => {
    const icons = {
      gpay: '🟢',
      phonepe: '🟣', 
      hdfc: '🔴',
      icici: '🟠',
      applepay: '⚪',
      paytm: '🔵'
    };
    return icons[platformId] || '💳';
  };

  const getPlatformColor = (platformId) => {
    const colors = {
      gpay: 'bg-green-100 text-green-800',
      phonepe: 'bg-purple-100 text-purple-800',
      hdfc: 'bg-red-100 text-red-800', 
      icici: 'bg-orange-100 text-orange-800',
      applepay: 'bg-gray-100 text-gray-800',
      paytm: 'bg-blue-100 text-blue-800'
    };
    return colors[platformId] || 'bg-gray-100 text-gray-800';
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Expense Dashboard</h1>
            <p className="text-blue-100">Track all your financial transactions in one place</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Net Balance</p>
            <p className="text-3xl font-bold">
              {summary ? formatCurrency(summary.net_balance) : '₹0'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">
                {summary ? formatCurrency(summary.total_spent) : '₹0'}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-red-600 text-xl">💸</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {summary ? formatCurrency(summary.total_income) : '₹0'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary ? summary.transaction_count : '0'}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Top Category</p>
              <p className="text-lg font-bold text-purple-600">
                {summary ? summary.top_category : 'None'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-purple-600 text-xl">🏷️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Monthly Spending Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {monthlyAnalytics.map((month, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-lg p-4 mb-2"
                   style={{height: `${Math.max((month.total_spent / 50000) * 100, 20)}px`}}>
              </div>
              <p className="text-sm font-medium text-gray-600">{month.month.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">{formatCurrency(month.total_spent)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Category Breakdown (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryAnalytics).map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{category}</p>
                <p className="text-sm text-gray-600">{data.transaction_count} transactions</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{formatCurrency(data.total_amount)}</p>
                <p className="text-sm text-blue-600">{data.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 8).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(transaction.platform)}`}>
                  <span>{getPlatformIcon(transaction.platform)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.merchant}</p>
                  <p className="text-sm text-gray-600">{transaction.category} • {formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.transaction_type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">{transaction.platform.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Platform Integrations</h2>
        <p className="text-gray-600 mb-8">Connect your payment platforms and bank accounts to automatically sync transactions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div key={integration.platform_id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPlatformColor(integration.platform_id)}`}>
                    <span className="text-xl">{getPlatformIcon(integration.platform_id)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{integration.platform_name}</h3>
                    <p className="text-sm text-gray-600">{integration.transaction_count} transactions</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  integration.is_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {integration.is_connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>

              {integration.is_connected && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-medium">{formatCurrency(integration.account_balance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="text-sm">{integration.last_sync ? formatDate(integration.last_sync) : 'Never'}</span>
                  </div>
                  <button 
                    onClick={() => fetchPlatformTransactions(integration.platform_id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Transactions
                  </button>
                </div>
              )}

              {!integration.is_connected && (
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Connect Account
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Platform-specific transactions */}
      {selectedPlatform && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {integrations.find(i => i.platform_id === selectedPlatform)?.platform_name} Transactions
            </h3>
            <button 
              onClick={() => {
                setSelectedPlatform(null);
                fetchData();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{transaction.merchant}</p>
                  <p className="text-sm text-gray-600">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.transaction_type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">Ref: {transaction.reference_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Transactions</h2>
        
        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Platforms</option>
            {integrations.filter(i => i.is_connected).map(integration => (
              <option key={integration.platform_id} value={integration.platform_id}>
                {integration.platform_name}
              </option>
            ))}
          </select>
          
          <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            {Object.keys(categoryAnalytics).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <input 
            type="date" 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPlatformColor(transaction.platform)}`}>
                  <span>{getPlatformIcon(transaction.platform)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.merchant}</p>
                  <p className="text-sm text-gray-600">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.transaction_type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">{transaction.platform.toUpperCase()}</p>
                <p className="text-xs text-gray-400">Balance: {formatCurrency(transaction.balance_after || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <span className="text-white text-xl font-bold">💰</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">ExpenseTracker Pro</h1>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'integrations' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔗 Integrations
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'transactions' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Transactions
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'transactions' && renderTransactions()}
      </main>
    </div>
  );
};

export default App;