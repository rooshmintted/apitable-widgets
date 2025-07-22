/**
 * Split Expense Widget for APITable
 * Splits transactions with multiple products into individual product transactions
 */

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  useRecords,
  useFields,
  useActiveViewId,
  useCloudStorage,
  useSettingsButton,
  initializeWidget,
  FieldType,
  useDatasheet
} from '@apitable/widget-sdk';

// Types for our transaction data
interface Transaction {
  id: string;
  title: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  category: string;
  merchant: string;
  date: string;
  products: Array<{id?: string, name: string}>;
  reconciled: boolean;
  productCount: number;
}

interface SplitTransaction {
  originalId: string;
  title: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  category: string;
  merchant: string;
  date: string;
  product: string;
  productId?: string;
  editedAmount?: number;
}

// Utility function to format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Removed settings panel - using hardcoded USD currency

// Split Transaction Row Component
const SplitTransactionRow: React.FC<{
  splitTx: SplitTransaction;
  currency: string;
  onAmountChange: (originalId: string, product: string, amount: number) => void;
}> = ({ splitTx, currency, onAmountChange }) => {
  const [editingAmount, setEditingAmount] = useState<number>(splitTx.editedAmount || splitTx.amount);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingAmount(numValue);
    onAmountChange(splitTx.originalId, splitTx.product, numValue);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
      gap: '12px',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '8px',
      fontSize: '14px'
    }}>
      <div>
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>{splitTx.title}</div>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          fontWeight: '500'
        }}>
          Product: {splitTx.product}
        </div>
      </div>
      <div style={{ 
        color: splitTx.type === 'Revenue' ? '#28a745' : '#dc3545',
        fontWeight: '500'
      }}>
        {splitTx.type}
      </div>
      <div style={{ fontWeight: '500', color: '#6c757d' }}>{splitTx.category}</div>
      <div style={{ fontWeight: '500', color: '#6c757d' }}>{splitTx.merchant}</div>
      <div style={{ fontWeight: '500', color: '#6c757d', fontSize: '12px' }}>
        {splitTx.date ? new Date(splitTx.date).toLocaleDateString() : 'No date'}
      </div>
      <div style={{ fontWeight: '500', color: '#6c757d' }}>
        Original: {formatCurrency(splitTx.amount, currency)}
      </div>
      <input
        type="number"
        value={editingAmount}
        onChange={(e) => handleAmountChange(e.target.value)}
        step="0.01"
        min="0"
        style={{
          padding: '6px 8px',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          fontSize: '14px',
          textAlign: 'right',
          fontWeight: '600',
          color: '#000000'
        }}
      />
    </div>
  );
};

// Main Split Expense Widget Component
const SplitExpenseWidget: React.FC = () => {
  const viewId = useActiveViewId();
  const fields = useFields(viewId);
  const records = useRecords(viewId);
  const datasheet = useDatasheet();
  const [isShowingSettings, toggleSettings] = useSettingsButton();

  // Currency for display (hardcoded to USD for now)
  const currency = 'USD';

  // Local state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [splitTransactions, setSplitTransactions] = useState<SplitTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find the relevant fields
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

  const productsField = fields.find(field =>
    field.name.toLowerCase().includes('products') ||
    field.name.toLowerCase().includes('product')
  );

  const reconciledField = fields.find(field =>
    field.name.toLowerCase().includes('reconciled') ||
    field.type === FieldType.Checkbox
  );

  // Track recently split transactions to avoid re-processing
  const [recentlySplit, setRecentlySplit] = useState<Set<string>>(new Set());

  // Process transactions to find those with multiple products that haven't been reconciled
  const transactionsToSplit = useMemo(() => {
    if (!titleField || !typeField || !amountField || !productsField || !records.length) {
      return [];
    }

    const transactions: Transaction[] = records.map(record => {
      const title = record.getCellValueString(titleField.id) || 'Untitled';
      const typeValue = record.getCellValue(typeField.id) || '';
      const amount = Number(record.getCellValue(amountField.id)) || 0;
      const category = categoryField ? (record.getCellValueString(categoryField.id) || 'Other') : 'Other';
      const merchant = merchantField ? (record.getCellValueString(merchantField.id) || 'Unknown') : 'Unknown';
      const date = dateField ? (record.getCellValueString(dateField.id) || '') : '';
      const productsValue = record.getCellValue(productsField.id) || '';
      const reconciled = reconciledField ? Boolean(record.getCellValue(reconciledField.id)) : false;

      // Parse products - handle Link field (array of record objects) or text field
      let products: Array<{id?: string, name: string}> = [];
      if (typeof productsValue === 'string') {
        // Simple text field with comma-separated values
        products = productsValue.split(',').map(p => ({ name: p.trim() })).filter(p => p.name.length > 0);
      } else if (Array.isArray(productsValue)) {
        // Link field with record objects or simple array
        products = productsValue.map(p => {
          if (typeof p === 'object' && p !== null) {
            // Linked record object - extract name/title and ID
            const name = p.title || p.name || p.text || p.value || String(p);
            const id = p.id || p.recordId || p.key || p._id;
            return { id: id, name: String(name) };
          } else {
            // Simple value
            return { name: String(p).trim() };
          }
        }).filter(p => p.name.length > 0);

        // Remove duplicates based on product ID (preferred) or name
        const uniqueProducts: Array<{id?: string, name: string}> = [];
        const seen = new Set<string>();
        
        products.forEach((product) => {
          // Prefer ID over name for deduplication key
          const key = product.id ? `id:${product.id}` : `name:${product.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueProducts.push(product);
          }
        });
        
        products = uniqueProducts;
      }

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
        products,
        reconciled,
        productCount: products.length,
      };
    });

    // Filter for transactions with multiple products that haven't been reconciled and weren't recently split
    return transactions.filter(tx => 
      tx.productCount > 1 && 
      !tx.reconciled && 
      !recentlySplit.has(tx.id)
    );
      }, [records, titleField, typeField, amountField, categoryField, merchantField, dateField, productsField, reconciledField, recentlySplit]);

  // Handle transaction selection for splitting
  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Create split transactions with equal amounts
    const amountPerProduct = transaction.amount / transaction.productCount;
    const splits: SplitTransaction[] = transaction.products.map((product) => ({
      originalId: transaction.id,
      title: transaction.title,
      type: transaction.type,
      amount: amountPerProduct,
      category: transaction.category,
      merchant: transaction.merchant,
      date: transaction.date,
      product: product.name,
      productId: product.id,
      editedAmount: amountPerProduct,
    }));

    setSplitTransactions(splits);
  };

  // Handle amount changes for split transactions
  const handleSplitAmountChange = (originalId: string, product: string, amount: number) => {
    setSplitTransactions(prev => 
      prev.map(split => 
        split.originalId === originalId && split.product === product 
          ? { ...split, editedAmount: amount }
          : split
      )
    );
  };

  // Handle reconciliation - create new records and mark original as reconciled
  const handleReconcile = async () => {
    if (!selectedTransaction || !datasheet || splitTransactions.length === 0) {
      console.error('Missing required data for reconciliation');
      return;
    }

    // Prevent multiple clicks
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Safety check: ensure we have the expected number of splits
      if (splitTransactions.length !== selectedTransaction.productCount) {
        throw new Error(`Mismatch: Expected ${selectedTransaction.productCount} splits but got ${splitTransactions.length}`);
      }
      
      // Create new records for each split transaction
      const newRecords = splitTransactions.map((split) => {
        const recordData: { [fieldId: string]: any } = {};
        
        if (titleField) recordData[titleField.id] = split.title;
        if (typeField) recordData[typeField.id] = split.type;
        if (amountField) recordData[amountField.id] = split.editedAmount || split.amount;
        if (categoryField) recordData[categoryField.id] = split.category;
        if (merchantField) recordData[merchantField.id] = split.merchant;
        if (dateField) recordData[dateField.id] = split.date;
        if (productsField && split.productId) {
          // Only set Products field if we have a valid product ID (Link field)
          recordData[productsField.id] = [split.productId];
        }
        // Note: If no productId, we skip setting the Products field to avoid validation errors
        if (reconciledField) recordData[reconciledField.id] = false; // New records are not reconciled yet

        return { valuesMap: recordData };
      });
      
      // Add the new records
      await datasheet.addRecords(newRecords);

      // Mark transaction as recently split to hide it from the list
      setRecentlySplit(prev => new Set([...Array.from(prev), selectedTransaction.id]));
      
      // Reset state
      setSelectedTransaction(null);
      setSplitTransactions([]);
      
      alert(`Successfully created ${newRecords.length} split transactions! Original transaction is now hidden. You can manually mark it as reconciled.`);
    } catch (error) {
      console.error('Error creating split transactions:', error);
      alert(`Error creating split transactions: ${error instanceof Error ? error.message : String(error)}. Please try again.`);
    } finally {
      // Always reset processing state
      setIsProcessing(false);
    }
  };

  // If required fields are not found, show setup message
  if (!titleField || !typeField || !amountField || !productsField) {
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
            <li><strong>Products:</strong> Text field for comma-separated product list</li>
            <li><strong>Category:</strong> Text field for categorization (optional)</li>
            <li><strong>Merchant:</strong> Text field for merchant names (optional)</li>
            <li><strong>Date:</strong> Date field for transaction dates (optional)</li>
            <li><strong>Reconciled:</strong> Checkbox field to track reconciliation status (optional)</li>
          </ul>
          <p style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Please ensure your datasheet has the required fields and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '500px'
    }}>
      {/* Settings Panel removed */}

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
          ✂️ Split Expense Widget
        </h1>
        <p style={{
          margin: 0,
          color: '#6c757d',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Split transactions with multiple products • {transactionsToSplit.length} transactions to split
        </p>
      </div>

      {/* Transactions List */}
      {!selectedTransaction && (
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
            📋 Transactions to Split
          </h3>

          {transactionsToSplit.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>
                No transactions to split
              </h4>
              <p style={{ margin: 0 }}>
                All transactions with multiple products have been reconciled or no multi-product transactions found.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {transactionsToSplit.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #f8f9fa',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleSelectTransaction(transaction)}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>{transaction.title}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d',
                      fontWeight: '500'
                    }}>
                      {transaction.productCount} products: {transaction.products.map(p => p.name).join(', ')}
                    </div>
                  </div>
                  <div style={{
                    color: transaction.type === 'Revenue' ? '#28a745' : '#dc3545',
                    fontWeight: '500'
                  }}>
                    {transaction.type}
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
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Split
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Split Transaction Editor */}
      {selectedTransaction && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✂️ Splitting: {selectedTransaction.title}
            </h3>
            <button
              onClick={() => {
                setSelectedTransaction(null);
                setSplitTransactions([]);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{
            backgroundColor: '#e7f3ff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#004085'
          }}>
            <strong>Original Amount:</strong> {formatCurrency(selectedTransaction.amount, currency)} • 
            <strong> Products:</strong> {selectedTransaction.productCount} • 
            <strong> Amount per product:</strong> {formatCurrency(selectedTransaction.amount / selectedTransaction.productCount, currency)}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
            gap: '12px',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6c757d'
          }}>
            <div>TRANSACTION & PRODUCT</div>
            <div>TYPE</div>
            <div>CATEGORY</div>
            <div>MERCHANT</div>
            <div>DATE</div>
            <div>ORIGINAL</div>
            <div>NEW AMOUNT</div>
          </div>

          {splitTransactions.map((splitTx, index) => (
            <SplitTransactionRow
              key={`${splitTx.originalId}-${splitTx.product}-${index}`}
              splitTx={splitTx}
              currency={currency}
              onAmountChange={handleSplitAmountChange}
            />
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <strong>Total New Amount:</strong> {formatCurrency(
                splitTransactions.reduce((sum, split) => sum + (split.editedAmount || split.amount), 0),
                currency
              )}
            </div>
            <button
              onClick={handleReconcile}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: isProcessing ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? 'Processing...' : 'Split Transaction'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Initialize the widget
initializeWidget(SplitExpenseWidget, process.env.WIDGET_PACKAGE_ID!);

export default SplitExpenseWidget; 