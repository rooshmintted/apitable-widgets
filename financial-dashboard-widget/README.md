# Financial Dashboard Widget for APITable

A comprehensive financial dashboard widget that calculates profit and loss from your datasheet records.

## Features

- 💰 **Profit & Loss Calculations**: Automatically calculates total revenue, expenses, and net profit
- 📊 **Visual Charts**: Beautiful bar charts comparing revenue vs expenses
- 🎛️ **Customizable Settings**: Choose currency and toggle transaction details
- 📝 **Transaction Details**: View detailed breakdown of all financial transactions
- 💱 **Multi-Currency Support**: USD, EUR, GBP, JPY
- 📱 **Responsive Design**: Works on desktop and mobile

## Data Requirements

Your datasheet must contain these field types:

1. **Title Field**: Text field (SingleText or Text) for transaction descriptions
2. **Category Field**: Single Select field with options for "Revenue" and "Expense"
3. **Amount Field**: Number or Currency field for transaction amounts

### Example Data Structure

| Title | Options | Amount |
|-------|---------|--------|
| COGS  | Expense | 4.45   |
| Sale  | Revenue | 13.22  |
| COGS  | Expense | 4.45   |
| Sale  | Revenue | 13.22  |

## Installation

1. Copy the `financial-dashboard-widget.tsx` file to your widget development environment
2. Install the widget using the APITable widget system
3. Add the widget to your datasheet or dashboard

## Usage

1. **Setup your datasheet** with the required field types
2. **Add the widget** to your datasheet or dashboard
3. **Configure settings** by clicking the settings button:
   - Choose your preferred currency
   - Toggle transaction details view
4. **View your financial data** with automatic calculations

## Calculations

- **Total Revenue**: Sum of all transactions marked as "Revenue"
- **Total Expenses**: Sum of all transactions marked as "Expense"  
- **Net Profit**: Total Revenue - Total Expenses
- **Profit Margin**: (Net Profit ÷ Total Revenue) × 100

## Widget Settings

The widget provides persistent settings stored in APITable's cloud storage:

- **Currency**: Choose from USD, EUR, GBP, JPY
- **Show Transactions**: Toggle detailed transaction list

## Development

This widget uses the APITable Widget SDK with the following hooks:

- `useRecords()` - Fetch datasheet records
- `useFields()` - Get field information
- `useActiveViewId()` - Get current view
- `useCloudStorage()` - Persistent widget settings
- `useSettingsButton()` - Settings panel toggle

## Customization

You can customize the widget by modifying:

- **Colors**: Update the CSS color schemes in the component
- **Currency Options**: Add more currencies to the settings panel
- **Calculations**: Modify the financial calculation logic
- **Charts**: Enhance the visual representation of data

## Contributing

Feel free to submit issues and enhancement requests!

## License

This widget is part of the APITable project and follows the same AGPL-3.0 license. 