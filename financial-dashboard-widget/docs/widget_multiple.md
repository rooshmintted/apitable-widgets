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