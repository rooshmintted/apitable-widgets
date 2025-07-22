/**
 * Financial Dashboard Widget for APITable
 * Calculates and displays profit & loss from financial data
 */

import React, { useMemo } from 'react';
import { 
  useRecords, 
  useFields, 
  useActiveViewId, 
  useCloudStorage, 
  useSettingsButton, 
  initializeWidget,
  FieldType 
} from '@apitable/widget-sdk';

// Types for our financial data
interface FinancialRecord {
  id: string;
  title: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  category: string;
  merchant: string;
  date: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  transactions: FinancialRecord[];
  revenueTransactions: FinancialRecord[];
  expenseTransactions: FinancialRecord[];
}

interface ChartData {
  label: string;
  revenue: number;
  expenses: number;
  net: number;
  count: number;
}

type GroupByOption = 'type' | 'merchant' | 'category' | 'date';

// Utility function to format currency
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Enhanced Settings component
const SettingsPanel: React.FC<{
  currency: string;
  setCurrency: (currency: string) => void;
  showTransactions: boolean;
  setShowTransactions: (show: boolean) => void;
  groupBy: GroupByOption;
  setGroupBy: (groupBy: GroupByOption) => void;
}> = ({ currency, setCurrency, showTransactions, setShowTransactions, groupBy, setGroupBy }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: '#ffffff', 
    borderRadius: '12px', 
    marginBottom: '20px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <h3 style={{ 
      margin: '0 0 20px 0', 
      fontSize: '18px', 
      fontWeight: '600',
      color: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      ⚙️ Dashboard Settings
    </h3>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#495057'
        }}>
          Currency:
        </label>
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '6px', 
            border: '1px solid #dee2e6', 
            width: '100%',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#495057'
        }}>
          Group chart by:
        </label>
        <select 
          value={groupBy} 
          onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '6px', 
            border: '1px solid #dee2e6', 
            width: '100%',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="type">Type (Revenue/Expense)</option>
          <option value="merchant">Merchant</option>
          <option value="category">Category</option>
          <option value="date">Date (Monthly)</option>
        </select>
      </div>
    </div>

    <div style={{ marginTop: '16px' }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px', 
        cursor: 'pointer',
        color: '#495057'
      }}>
        <input
          type="checkbox"
          checked={showTransactions}
          onChange={(e) => setShowTransactions(e.target.checked)}
          style={{ marginRight: '10px', transform: 'scale(1.1)' }}
        />
        Show detailed transaction list
      </label>
    </div>
  </div>
);

// Enhanced Chart component
const FinancialChart: React.FC<{
  data: ChartData[];
  currency: string;
  groupBy: GroupByOption;
}> = ({ data, currency, groupBy }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)));
  
  const getChartTitle = () => {
    switch (groupBy) {
      case 'merchant': return 'Revenue vs Expenses by Merchant';
      case 'category': return 'Revenue vs Expenses by Category';
      case 'date': return 'Revenue vs Expenses by Month';
      default: return 'Revenue vs Expenses Overview';
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '24px', 
      marginBottom: '20px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '18px', 
        fontWeight: '600',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📊 {getChartTitle()}
      </h3>
      
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <p>No data available for the selected grouping</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '20px', 
            height: '200px',
            minWidth: `${data.length * 120}px`,
            padding: '0 10px'
          }}>
            {data.map((item, index) => (
              <div key={index} style={{ 
                flex: '0 0 auto',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                minWidth: '100px'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#495057',
                  wordBreak: 'break-word',
                  maxWidth: '100px'
                }}>
                  {item.label}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {/* Revenue Bar */}
                  <div style={{
                    width: '30px',
                    height: `${Math.max((item.revenue / maxValue) * 140, 8)}px`,
                    backgroundColor: '#28a745',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}>
                    {item.revenue > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#28a745'
                      }}>
                        📈
                      </div>
                    )}
                  </div>
                  
                  {/* Expenses Bar */}
                  <div style={{
                    width: '30px',
                    height: `${Math.max((item.expenses / maxValue) * 140, 8)}px`,
                    backgroundColor: '#dc3545',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}>
                    {item.expenses > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#dc3545'
                      }}>
                        📉
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '10px', 
                  textAlign: 'center',
                  color: '#6c757d',
                  lineHeight: '1.2'
                }}>
                  <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                    {formatCurrency(item.revenue, currency)}
                  </div>
                  <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
                    {formatCurrency(item.expenses, currency)}
                  </div>
                  <div style={{ 
                    color: item.net >= 0 ? '#28a745' : '#dc3545', 
                    fontWeight: 'bold',
                    marginTop: '2px'
                  }}>
                    Net: {formatCurrency(item.net, currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main dashboard component
const FinancialDashboard: React.FC = () => {
  const viewId = useActiveViewId();
  const fields = useFields(viewId);
  const records = useRecords(viewId);
  const [isShowingSettings, toggleSettings] = useSettingsButton();
  
  // Widget settings stored in cloud
  const [currency, setCurrency] = useCloudStorage('currency', 'USD');
  const [showTransactions, setShowTransactions] = useCloudStorage('showTransactions', true);
  const [groupBy, setGroupBy] = useCloudStorage<GroupByOption>('groupBy', 'type');

  // Find the relevant fields based on the new data model
  const titleField = fields.find(field => 
    field.name.toLowerCase().includes('title') ||
    (field.type === FieldType.SingleText || field.type === FieldType.Text)
  );
  
  const typeField = fields.find(field => 
    field.name.toLowerCase().includes('type') ||
    (field.type === FieldType.SingleSelect && field.name.toLowerCase().includes('type'))
  );
  
  const amountField = fields.find(field => 
    field.name.toLowerCase().includes('amount') ||
    field.type === FieldType.Number || 
    field.type === FieldType.Currency
  );
  
  const categoryField = fields.find(field => 
    field.name.toLowerCase().includes('category')
  );
  
  const merchantField = fields.find(field => 
    field.name.toLowerCase().includes('merchant')
  );
  
  const dateField = fields.find(field => 
    field.name.toLowerCase().includes('date') ||
    field.type === FieldType.DateTime ||
    field.type === FieldType.CreatedTime
  );

  // Process financial data
  const financialSummary: FinancialSummary = useMemo(() => {
    if (!titleField || !typeField || !amountField || !records.length) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        transactions: [],
        revenueTransactions: [],
        expenseTransactions: [],
      };
    }

    const transactions: FinancialRecord[] = records.map(record => {
      const title = record.getCellValueString(titleField.id) || 'Untitled';
      const typeValue = record.getCellValue(typeField.id) || '';
      const amount = Number(record.getCellValue(amountField.id)) || 0;
      const category = categoryField ? (record.getCellValueString(categoryField.id) || 'Other') : 'Other';
      const merchant = merchantField ? (record.getCellValueString(merchantField.id) || 'Unknown') : 'Unknown';
      const date = dateField ? (record.getCellValueString(dateField.id) || '') : '';
      
      // Determine type from the Type field
      let type: 'Revenue' | 'Expense' = 'Expense';
      const typeStr = String(typeValue).toLowerCase();
      if (typeStr.includes('revenue') || typeStr === 'revenue') {
        type = 'Revenue';
      }

      return {
        id: record.id,
        title,
        type,
        amount: Math.abs(amount),
        category,
        merchant,
        date,
      };
    });

    const revenueTransactions = transactions.filter(t => t.type === 'Revenue');
    const expenseTransactions = transactions.filter(t => t.type === 'Expense');
    
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      transactions,
      revenueTransactions,
      expenseTransactions,
    };
  }, [records, titleField, typeField, amountField, categoryField, merchantField, dateField]);

  // Generate chart data based on groupBy selection
  const chartData: ChartData[] = useMemo(() => {
    const { transactions } = financialSummary;
    
    if (transactions.length === 0) return [];

    const groups: { [key: string]: FinancialRecord[] } = {};

    // Group transactions based on the selected option
    transactions.forEach(transaction => {
      let key: string;
      
      switch (groupBy) {
        case 'merchant':
          key = transaction.merchant;
          break;
        case 'category':
          key = transaction.category;
          break;
        case 'date':
          // Group by month
          const date = new Date(transaction.date);
          if (isNaN(date.getTime())) {
            key = 'Unknown Date';
          } else {
            key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          }
          break;
        case 'type':
        default:
          key = transaction.type;
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });

    // Convert groups to chart data
    return Object.entries(groups).map(([label, groupTransactions]) => {
      const revenue = groupTransactions
        .filter(t => t.type === 'Revenue')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = groupTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        label,
        revenue,
        expenses,
        net: revenue - expenses,
        count: groupTransactions.length,
      };
    }).sort((a, b) => {
      // Sort by net profit descending
      return b.net - a.net;
    });
  }, [financialSummary, groupBy]);

  // If no proper fields found, show setup message
  if (!titleField || !typeField || !amountField) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: '#dc3545', marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
          Setup Required
        </h2>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <p style={{ marginBottom: '16px', fontSize: '16px', color: '#495057' }}>
            This widget requires a datasheet with these fields:
          </p>
          <ul style={{ 
            color: '#6c757d',
            fontSize: '14px',
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li><strong>Title:</strong> Text field for transaction descriptions</li>
            <li><strong>Type:</strong> Single select field with "Revenue" and "Expense" options</li>
            <li><strong>Amount:</strong> Number or currency field for transaction amounts</li>
            <li><strong>Category:</strong> Text field for categorization (optional)</li>
            <li><strong>Merchant:</strong> Text field for merchant names (optional)</li>
            <li><strong>Date:</strong> Date field for transaction dates (optional)</li>
          </ul>
          <p style={{ 
            marginTop: '20px', 
            fontSize: '14px', 
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Please ensure your datasheet has at least the required fields (Title, Type, Amount) and try again.
          </p>
        </div>
      </div>
    );
  }

  const { totalRevenue, totalExpenses, netProfit, profitMargin, revenueTransactions, expenseTransactions } = financialSummary;

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      backgroundColor: '#f8f9fa', 
      minHeight: '500px'
    }}>
      {/* Settings Panel */}
      {isShowingSettings && (
        <SettingsPanel
          currency={currency}
          setCurrency={setCurrency}
          showTransactions={showTransactions}
          setShowTransactions={setShowTransactions}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
        />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          💰 Financial Dashboard
        </h1>
        <p style={{ 
          margin: 0, 
          color: '#6c757d', 
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Profit & Loss Analysis • {financialSummary.transactions.length} transactions
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Revenue Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          borderLeft: '4px solid #28a745',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ 
            fontSize: '16px', 
            color: '#28a745', 
            fontWeight: '600', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📈 Total Revenue
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745', marginBottom: '4px' }}>
            {formatCurrency(totalRevenue, currency)}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {revenueTransactions.length} transactions
          </div>
        </div>

        {/* Expenses Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          borderLeft: '4px solid #dc3545',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ 
            fontSize: '16px', 
            color: '#dc3545', 
            fontWeight: '600', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📉 Total Expenses
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc3545', marginBottom: '4px' }}>
            {formatCurrency(totalExpenses, currency)}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {expenseTransactions.length} transactions
          </div>
        </div>

        {/* Net Profit Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          borderLeft: `4px solid ${netProfit >= 0 ? '#17a2b8' : '#dc3545'}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ 
            fontSize: '16px', 
            color: netProfit >= 0 ? '#17a2b8' : '#dc3545', 
            fontWeight: '600', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {netProfit >= 0 ? '✅' : '❌'} Net Profit
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: netProfit >= 0 ? '#17a2b8' : '#dc3545',
            marginBottom: '4px'
          }}>
            {formatCurrency(netProfit, currency)}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {profitMargin.toFixed(1)}% margin
          </div>
        </div>
      </div>

      {/* Enhanced Chart */}
      <FinancialChart data={chartData} currency={currency} groupBy={groupBy} />

      {/* Transaction Details */}
      {showTransactions && financialSummary.transactions.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Transaction Details
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {financialSummary.transactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < financialSummary.transactions.length - 1 ? '1px solid #f8f9fa' : 'none',
                  fontSize: '14px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{transaction.title}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: transaction.type === 'Revenue' ? '#28a745' : '#dc3545',
                    fontWeight: '500'
                  }}>
                    {transaction.type === 'Revenue' ? '📈' : '📉'} {transaction.type}
                  </div>
                </div>
                <div style={{ fontWeight: '500', color: '#6c757d' }}>{transaction.category}</div>
                <div style={{ fontWeight: '500', color: '#6c757d' }}>{transaction.merchant}</div>
                <div style={{ fontWeight: '500', color: '#6c757d', fontSize: '12px' }}>
                  {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'No date'}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  color: transaction.type === 'Revenue' ? '#28a745' : '#dc3545',
                  textAlign: 'right'
                }}>
                  {formatCurrency(transaction.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {financialSummary.transactions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px', 
          color: '#6c757d',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '20px', fontWeight: '600' }}>
            No financial data found
          </h3>
                     <p style={{ margin: '0 auto', fontSize: '16px', maxWidth: '400px' }}>
             Add some records with revenue and expense transactions to see your financial dashboard come to life.
           </p>
        </div>
      )}
    </div>
  );
};

// Initialize the widget
initializeWidget(FinancialDashboard, process.env.WIDGET_PACKAGE_ID!);

export default FinancialDashboard;
