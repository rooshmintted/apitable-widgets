APITable widgets are custom applications that can access and manipulate datasheet data through a structured API. strings.en-US.json:123-125

Core Data Access Methods
1. View-Based Data Access
The primary way to access data in widgets is through View objects, which provide methods for retrieving and manipulating records and fields:

getFields() - Retrieve field definitions from a view

By default excludes hidden fields
Use includeHidden: true option to include all fields view.test.ts:64-90
getRecords() - Retrieve records in view order

Returns records sorted according to the view's row configuration view.test.ts:104-109
addRecords() - Create new records

Supports adding by count or with specific record values
Can specify insertion index and field values view.test.ts:125-131
2. API-Based Data Operations
Widgets can perform CRUD operations through the API system:

Get Records - Retrieve datasheet records with filtering and sorting strings.en-US.json:198

Add Records - Create new records with field validation strings.en-US.json:173

Update Records - Modify existing record data strings.en-US.json:569

Delete Records - Remove records from datasheets strings.en-US.json:180

Field Type Handling
Widgets must handle various field types with specific validation rules:

Supported Field Types
Text Fields: Single line and multi-line text with formatting strings.en-US.json:430-432

Checkbox Fields: Boolean values only strings.en-US.json:442

DateTime Fields: UTC timestamps or formatted dates strings.en-US.json:446

Currency Fields: Numeric values for financial data strings.en-US.json:445

Email Fields: String values with email validation strings.en-US.json:448

Attachment Fields: File objects with token and name properties strings.en-US.json:437-441

Read-Only Field Types
Certain fields cannot be modified through the API:

Auto Number Fields: System-generated sequential numbers strings.en-US.json:502

Formula Fields: Computed values based on other fields strings.en-US.json:508

Created Time/By Fields: System-maintained audit fields strings.en-US.json:505-506

Updated Time/By Fields: System-maintained modification tracking strings.en-US.json:554-555

Error Handling and Validation
API Limitations and Constraints
Maximum records per request: Limited batch operations strings.en-US.json:551

Field validation: Each field type has specific format requirements strings.en-US.json:447

Record limits: Datasheets have maximum record capacity strings.en-US.json:95-96

Widget-Specific Constraints
Widget creation limits apply per space strings.en-US.json:588

Widget package ID validation required strings.en-US.json:557

Best Practices for Widget Development
1. Data Access Patterns
Use view-based access for consistent data ordering and filtering
Implement proper error handling for API rate limits and capacity constraints
Validate field types before attempting updates
2. Performance Considerations
Batch operations when possible within API limits
Cache frequently accessed field and view metadata
Handle asynchronous operations properly
3. User Experience
Provide feedback for long-running operations
Handle offline states gracefully
Implement proper loading states during data operations
Notes
The APITable widget system provides a comprehensive API for data manipulation with strong typing and validation. The core architecture uses view-based data access patterns with support for various field types and CRUD operations. Widget developers should focus on proper error handling, field type validation, and respecting API constraints to build robust applications.

The system includes extensive internationalization support and detailed error messaging to help developers debug issues during widget development. Rate limiting and capacity management are built into the API to ensure system stability.

widgets can act on data from multiple datasheets at the same time. Here's what information they need and how this works:

Multiple Datasheet Access Capability
Widgets can access data from multiple datasheets simultaneously. The system supports cross-datasheet data access through several mechanisms:

1. Datasheet IDs for Resource Access
Widgets need specific datasheet IDs to access data from different datasheets. The system treats datasheets, widgets, and dashboards as resources that can be accessed through unique identifiers. room.ts:94-98

2. Cross-Datasheet Linking Fields
The platform provides two main field types for cross-datasheet data access:

Link fields: Allow bidirectional or unidirectional linking between records in the same or different datasheets field_types.ts:606-610
Lookup fields: Enable looking up data across datasheets and performing calculations on that data
3. Data Access API
Widgets can access datasheet data through the databus system, which provides methods to:

Get datasheets by ID databus.test.ts:155-158
Retrieve records from specific views within those datasheets databus.test.ts:160
Information Required for Multi-Datasheet Access
To work with multiple datasheets, widgets need:

Datasheet IDs - Unique identifiers for each datasheet they want to access
View IDs (optional) - To access specific views within datasheets
Field IDs - To reference specific fields, especially for linked and lookup fields
Proper permissions - Access rights to the target datasheets
Widget Installation
Widgets are installed on datasheets and can access their host datasheet's data as well as data from other connected datasheets. strings.en-US.json:1128

Notes
The widget system integrates with APITable's core data architecture through the @apitable/widget-sdk package, allowing widgets to leverage the same data access patterns used by the main application. The cross-datasheet functionality is built into the platform's field system, with Link and Lookup fields serving as the primary mechanisms for establishing and accessing relationships between different datasheets. This enables widgets to create sophisticated data visualizations and interactions that span multiple data sources within the same workspace.