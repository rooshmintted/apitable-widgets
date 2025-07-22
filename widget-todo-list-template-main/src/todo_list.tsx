import {
  Box,
  Button,
  IconButton,
  TextInput,
  Typography,
} from "@apitable/components";
import { AddOutlined, ChevronRightOutlined, ChevronDownOutlined } from "@apitable/icons";
import {
  useCloudStorage,
  ViewPicker,
  FieldPicker,
  useRecords,
  useDatasheet,
  usePrimaryField,
  useFields,
  Record,
} from "@apitable/widget-sdk";
import React, { useState, useCallback, useMemo, useRef } from "react";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~ STYLES OBJECT ~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f4f5f7',
    fontFamily: 'sans-serif',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #dfe1e6',
    backgroundColor: '#ffffff',
    flexShrink: 0,
  },
  contentArea: {
    overflowY: 'auto',
    flexGrow: 1,
    padding: '8px 16px',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #dfe1e6',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  formItemContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '12px',
  },
  formItemLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526e',
    width: '100px',
  },
  infoBox: {
    textAlign: 'center',
    padding: '40px 20px',
    margin: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #dfe1e6',
  },
  infoText: {
    fontSize: '14px',
    color: '#6b778c',
  },
  warningText: {
    fontSize: '14px',
    color: '#de350b',
    fontWeight: 500,
  },
  recordItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #dfe1e6',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '8px',
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  recordItemChild: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    border: '1px solid #dfe1e6',
    borderLeft: '4px solid #0052cc',
    borderRadius: '0 8px 8px 0',
    padding: '12px 16px 12px 24px',
    marginBottom: '8px',
    marginLeft: '34px',
  },
  recordContent: {
    flexGrow: 1,
    marginLeft: '12px',
  },
  recordTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172b4d',
  },
  recordMeta: {
    fontSize: '12px',
    color: '#6b778c',
    marginTop: '4px',
  },
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~ RECORD ITEM COMPONENT ~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
interface IRecordItemProps {
  record: Record;
  isChild?: boolean;
  isExpanded: boolean;
  canSplit: boolean;
  isProcessing: boolean;
  lineItemCount: number;
  hasChildren: boolean;
  onToggleExpansion: (recordId: string) => void;
  onSplitRecord: (record: Record) => void;
  renderChildRecords: (parentRecordId: string) => React.ReactNode;
}

const RecordItemComponent: React.FC<IRecordItemProps> = (props) => {
  const {
    record,
    isChild,
    isExpanded,
    canSplit,
    isProcessing,
    lineItemCount,
    hasChildren,
    onToggleExpansion,
    onSplitRecord,
    renderChildRecords,
  } = props;

  const style = isChild ? styles.recordItemChild : styles.recordItem;
  constChevronIcon = isExpanded ? ChevronDownOutlined : ChevronRightOutlined;

  return (
    <React.Fragment>
      <Box style={style}>
        <Box style={{ alignSelf: 'flex-start', paddingTop: '2px' }}>
          {!isChild && (hasChildren || canSplit) ? (
            <IconButton
              icon={chevronIcon}
              onClick={() => onToggleExpansion(record.recordId)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              size="small"
            />
          ) : (
            <Box style={{ width: '32px' }} /> // Placeholder for alignment
          )}
        </Box>
        <div style={styles.recordContent}>
          <Typography variant="h6" style={styles.recordTitle}>
            {record.title || "Untitled Transaction"}
          </Typography>
          <Typography variant="body2" style={styles.recordMeta}>
            Line Items: {lineItemCount}
          </Typography>
        </div>
        {canSplit && (
          <Button
            color="primary"
            onClick={() => onSplitRecord(record)}
            disabled={isProcessing}
            size="small"
          >
            {isProcessing ? 'Splitting...' : 'Split'}
          </Button>
        )}
      </Box>

      {!isChild && isExpanded && renderChildRecords(record.recordId)}
    </React.Fragment>
  );
};

const RecordItem = React.memo(RecordItemComponent);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~ MAIN WIDGET COMPONENT ~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const TodoList: React.FC = () => {
  const datasheet = useDatasheet();
  const [viewId, setViewId] = useCloudStorage<string>("selectedViewId");
  const records = useRecords(viewId);
  const allFields = useFields(viewId);
  const [fieldId, setFieldId] = useCloudStorage<string>("selectedFieldId"); // The "Line Item" field
  const [newTransactionName, setNewTransactionName] = useState<string>('');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const isSplittingRef = useRef<boolean>(false);
  const primaryField = usePrimaryField();

  // Find the field for splitting, which we'll call "Line Item" in the UI.
  // We'll look for a field named 'product' case-insensitively for backward compatibility.
  const lineItemField = useMemo(() => {
    return allFields?.find(field => field.name.toLowerCase() === 'product');
  }, [allFields]);

  // Filter records to only those with multiple line items that can be split.
  const splittableRecords = useMemo(() => {
    if (!lineItemField) return [];
    return records.filter(record => {
      const cellValue = record.getCellValue(lineItemField.id);
      return Array.isArray(cellValue) && cellValue.length > 1;
    });
  }, [records, lineItemField]);

  // Find records that were created from a split (child records).
  const childRecords = useMemo(() => {
    // This assumes a naming convention. A more robust way would be a dedicated "Parent" link field.
    const parentTitles = new Set(splittableRecords.map(r => r.title));
    return records.filter(record => {
      for (const parentTitle of parentTitles) {
        if (parentTitle && record.title?.startsWith(`${parentTitle} - `)) {
          return true;
        }
      }
      return false;
    });
  }, [records, splittableRecords]);

  const addTransaction = useCallback(async () => {
    if (!newTransactionName?.trim() || !datasheet || !primaryField) {
      return;
    }
    const fieldsMap = { [primaryField.id]: newTransactionName.trim() };
    const check = datasheet.checkPermissionsForAddRecord(fieldsMap);
    if (!check.acceptable) {
      alert(check.message);
      return;
    }
    await datasheet.addRecord(fieldsMap);
    setNewTransactionName('');
  }, [datasheet, primaryField, newTransactionName]);

  const splitRecord = useCallback(async (parentRecord: Record) => {
    if (isSplittingRef.current || !datasheet || !lineItemField || !primaryField) {
      return;
    }
    isSplittingRef.current = true;
    setIsProcessing(true);

    try {
      const lineItems = parentRecord.getCellValue(lineItemField.id);
      if (!Array.isArray(lineItems) || lineItems.length <= 1) {
        return;
      }

      for (const [index, lineItemId] of lineItems.entries()) {
        const childFieldsMap = {
          [primaryField.id]: `${parentRecord.title} - Item ${index + 1}`,
          [lineItemField.id]: [lineItemId] // Link to a single line item
        };
        const check = datasheet.checkPermissionsForAddRecord(childFieldsMap);
        if (check.acceptable) {
          await datasheet.addRecord(childFieldsMap);
        } else {
          console.warn(`Permission denied to create child record: ${check.message}`);
        }
      }
      setExpandedRecords(prev => new Set(prev).add(parentRecord.recordId));
    } catch (error) {
      alert(`Failed to split transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isSplittingRef.current = false;
      setIsProcessing(false);
    }
  }, [datasheet, lineItemField, primaryField]);

  const toggleExpansion = useCallback((recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      newSet.has(recordId) ? newSet.delete(recordId) : newSet.add(recordId);
      return newSet;
    });
  }, []);

  const getChildRecordsForParent = useCallback((parentRecordId: string) => {
    const parentRecord = records.find(r => r.recordId === parentRecordId);
    if (!parentRecord) return [];
    return childRecords.filter(child => child.title?.startsWith(`${parentRecord.title} - `));
  }, [childRecords, records]);

  const renderChildRecords = useCallback((parentRecordId: string) => {
    const children = getChildRecordsForParent(parentRecordId);
    return children.map(child => (
      <RecordItem
        key={child.recordId}
        record={child}
        isChild
        isExpanded={false}
        canSplit={false}
        isProcessing={false}
        lineItemCount={1}
        hasChildren={false}
        onToggleExpansion={() => {}}
        onSplitRecord={() => {}}
        renderChildRecords={() => null}
      />
    ));
  }, [getChildRecordsForParent]);
  
  const FormItem = ({ label, children }) => (
    <Box style={styles.formItemContainer}>
      <Typography variant="body1" style={styles.formItemLabel}>{label}</Typography>
      <Box style={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );

  const renderContent = () => {
    if (!lineItemField) {
      return (
        <Box style={styles.infoBox}>
          <Typography variant="h6" style={styles.warningText}>Configuration Error</Typography>
          <p style={styles.infoText}>
            A Link field named "product" must exist in this view to identify line items.
          </p>
        </Box>
      );
    }

    if (splittableRecords.length === 0) {
      return (
        <Box style={styles.infoBox}>
          <Typography variant="h6" style={{color: '#172b4d'}}>No Transactions to Split</Typography>
          <p style={styles.infoText}>
            Only transactions with more than one linked line item are shown here.
          </p>
        </Box>
      );
    }

    return splittableRecords.map((record) => {
      const lineItems = record.getCellValue(lineItemField.id);
      const lineItemCount = Array.isArray(lineItems) ? lineItems.length : 0;
      const children = getChildRecordsForParent(record.recordId);

      return (
        <RecordItem
          key={record.recordId}
          record={record}
          isExpanded={expandedRecords.has(record.recordId)}
          canSplit={lineItemCount > 1}
          isProcessing={isProcessing}
          lineItemCount={lineItemCount}
          hasChildren={children.length > 0}
          onToggleExpansion={toggleExpansion}
          onSplitRecord={splitRecord}
          renderChildRecords={renderChildRecords}
        />
      );
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <FormItem label="Active View">
          <ViewPicker viewId={viewId} onChange={(option) => setViewId(option.value)} />
        </FormItem>
        <FormItem label="Line Item Field">
          <FieldPicker
            viewId={viewId}
            fieldId={lineItemField?.id}
            onChange={(option) => setFieldId(option.value)}
            placeholder="Should be a Link field named 'product'"
          />
        </FormItem>
      </header>
      
      <main style={styles.contentArea}>
        {renderContent()}
      </main>
      
      <footer style={styles.footer}>
        <TextInput
          block
          placeholder="Enter new transaction name..."
          value={newTransactionName}
          onChange={(e) => setNewTransactionName(e.target.value)}
          onPressEnter={addTransaction}
        />
        <Button
          color="primary"
          prefixIcon={<AddOutlined />}
          onClick={addTransaction}
          style={{ marginLeft: 8, flexShrink: 0 }}
        >
          Add
        </Button>
      </footer>
    </div>
  );
};