# Split Expense Widget for APITable

A specialized widget for splitting transactions with multiple products into individual product transactions for better expense tracking and reconciliation.

## Features

- 🔍 **Smart Filtering**: Automatically identifies transactions with multiple products that haven't been reconciled
- ✂️ **Transaction Splitting**: Splits master transactions into individual product transactions  
- 💰 **Amount Editing**: Allows manual adjustment of amounts for each split transaction
- ✅ **Reconciliation**: Marks original transactions as reconciled after splitting
- 💱 **Multi-Currency Support**: USD, EUR, GBP, JPY
- 📱 **Responsive Design**: Works on desktop and mobile

## Use Case

This widget is perfect for scenarios where you have:
- **Master transactions** containing multiple products (e.g., "COGS" transaction with "250g Sour Mix, 250g Variety Pack")
- **Need to split** these into individual product transactions for tracking
- **Manual amount adjustment** requirements for uneven splits
- **Reconciliation tracking** to avoid processing the same transaction twice

## Data Requirements

Your datasheet must contain these field types:

1. **Title Field**: Text field (SingleText or Text) for transaction descriptions
2. **Type Field**: Single Select field with options for "Revenue" and "Expense"
3. **Amount Field**: Number or Currency field for transaction amounts
4. **Products Field**: Text field containing comma-separated list of products
5. **Category Field**: Text field for categorization (optional)
6. **Merchant Field**: Text field for merchant names (optional)
7. **Date Field**: Date field for transaction dates (optional)
8. **Reconciled Field**: Checkbox field to track reconciliation status (optional)

### Example Data Structure

| Title | Type    | Amount | Products              | Category | Merchant | Date     | Reconciled |
|-------|---------|--------|-----------------------|----------|----------|----------|------------|
| COGS  | Expense | 4.45   | 250g Sour Mix, 250g Variety Pack | COGS | SNAX | 07/15/25 | ☐ |
| Sale  | Revenue | 13.22  | 250g Sour Mix        | Sale     | AMZ  | 07/15/25 | ☑ |

## How It Works

### 1. Transaction Detection
The widget automatically scans your datasheet for:
- Transactions with **multiple products** (comma-separated in Products field)
- Transactions that are **not reconciled** (Reconciled checkbox is unchecked)

### 2. Splitting Process
When you select a transaction to split:
- **Auto-calculation**: Amount is automatically divided equally among products
- **Manual editing**: You can adjust individual amounts as needed
- **Preservation**: Title, Type, Category, Merchant, and Date are preserved for each split

### 3. Reconciliation
When you save:
- **New records**: Individual product transactions are created
- **Original marking**: Original transaction is marked as reconciled
- **Tracking**: System prevents re-processing of reconciled transactions

## Installation

1. Copy the widget files to your APITable widget development environment
2. Install dependencies using `npm install` or `pnpm install`
3. Build the widget using `npm run release`
4. Install the widget in your APITable workspace

## Usage

1. **Setup your datasheet** with the required field types
2. **Add the widget** to your datasheet or dashboard
3. **View unreconciled transactions** with multiple products
4. **Click "Split"** on any transaction you want to process
5. **Adjust amounts** if needed for uneven splits
6. **Click "Save & Reconcile"** to create individual product transactions

## Widget Settings

The widget provides persistent settings:
- **Currency**: Choose from USD, EUR, GBP, JPY for display formatting

## Example Workflow

### Before Splitting:
```
COGS | Expense | $4.45 | "250g Sour Mix, 250g Variety Pack" | COGS | SNAX | 07/15/25 | ☐
```

### After Splitting:
```
COGS | Expense | $2.22 | "250g Sour Mix"     | COGS | SNAX | 07/15/25 | ☐
COGS | Expense | $2.23 | "250g Variety Pack" | COGS | SNAX | 07/15/25 | ☐
```

### Original Record:
```
COGS | Expense | $4.45 | "250g Sour Mix, 250g Variety Pack" | COGS | SNAX | 07/15/25 | ☑
```

## Development

This widget uses the APITable Widget SDK with the following hooks:

- `useRecords()` - Fetch datasheet records
- `useFields()` - Get field information  
- `useActiveViewId()` - Get current view
- `useDatasheet()` - Data manipulation operations
- `useCloudStorage()` - Persistent widget settings
- `useSettingsButton()` - Settings panel toggle

## API Operations

The widget performs these operations:
- **Read**: Filters records with multiple products and unreconciled status
- **Create**: Adds new individual product transaction records
- **Update**: Marks original transactions as reconciled

## Customization

You can customize the widget by modifying:

- **Field Detection**: Adjust field name matching logic in field finding functions
- **Product Parsing**: Modify how products are extracted from the Products field
- **UI Components**: Enhance the visual design and layout
- **Currency Options**: Add more currencies to the settings panel
- **Validation**: Add custom validation rules for split amounts

## Best Practices

1. **Consistent Naming**: Use consistent field names like "Title", "Type", "Amount", "Products"
2. **Product Format**: Use comma-separated values in the Products field
3. **Regular Reconciliation**: Process splits regularly to avoid large backlogs
4. **Amount Verification**: Always verify total amounts before reconciling
5. **Backup Data**: Keep backups before bulk reconciliation operations

## Contributing

Feel free to submit issues and enhancement requests!

## License

This widget is part of the APITable project and follows the same AGPL-3.0 license. 