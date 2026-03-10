# ESG Data Inventory - API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Currently, the API does not require authentication. This is an MVP feature to be added in production.

---

## Metrics

### Get All Metrics

```http
GET /api/metrics
```

**Query Parameters:**
- `category` (optional) - Filter by category: E, S, or G
- `status` (optional) - Filter by status: COLLECTED, PARTIAL, PLANNED
- `search` (optional) - Search in name and description

**Example:**
```bash
curl http://localhost:3000/api/metrics?category=E&status=COLLECTED
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Total Energy Consumption",
    "description": "Total electricity and gas consumption",
    "category": "E",
    "unit": "kWh",
    "standard": "GRI",
    "status": "COLLECTED",
    "createdAt": "2026-03-05T10:00:00.000Z",
    "updatedAt": "2026-03-05T10:00:00.000Z",
    "metricLinks": [...]
  }
]
```

---

### Get Metrics Statistics

```http
GET /api/metrics/stats
```

**Response:**
```json
{
  "total": 12,
  "byCategory": [
    { "category": "E", "_count": 5 },
    { "category": "S", "_count": 4 },
    { "category": "G", "_count": 3 }
  ],
  "byStatus": [
    { "status": "COLLECTED", "_count": 8 },
    { "status": "PARTIAL", "_count": 3 },
    { "status": "PLANNED", "_count": 1 }
  ]
}
```

---

### Get Single Metric

```http
GET /api/metrics/:id
```

**Example:**
```bash
curl http://localhost:3000/api/metrics/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Total Energy Consumption",
  "description": "Total electricity and gas consumption",
  "category": "E",
  "unit": "kWh",
  "standard": "GRI",
  "status": "COLLECTED",
  "metricLinks": [
    {
      "id": 1,
      "source": {
        "id": 1,
        "name": "Energy Consumption Report",
        "type": "EXCEL"
      },
      "department": {
        "id": 1,
        "name": "Facilities Management",
        "owner": "John Smith"
      },
      "storage": {
        "id": 1,
        "locationName": "Google Drive - ESG Data",
        "type": "DRIVE"
      },
      "qualityScore": 95,
      "lastUpdate": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Metric

```http
POST /api/metrics
```

**Request Body:**
```json
{
  "name": "Carbon Footprint",
  "description": "Total carbon emissions from operations",
  "category": "E",
  "unit": "tCO2e",
  "standard": "GRI",
  "status": "PLANNED"
}
```

**Required fields:**
- `name` (string)
- `category` (enum: E, S, G)

**Optional fields:**
- `description` (string)
- `unit` (string)
- `standard` (enum: GRI, STARS, SDG)
- `status` (enum: COLLECTED, PARTIAL, PLANNED) - Default: PLANNED

**Response:** Returns created metric object

---

### Update Metric

```http
PUT /api/metrics/:id
```

**Request Body:** Same as Create Metric

---

### Delete Metric

```http
DELETE /api/metrics/:id
```

**Response:**
```json
{
  "message": "Metric deleted successfully"
}
```

---

## Data Sources

### Get All Data Sources

```http
GET /api/sources
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Energy Consumption Report",
    "type": "EXCEL",
    "format": ".xlsx",
    "updateFrequency": "Monthly",
    "createdAt": "2026-03-05T10:00:00.000Z",
    "metricLinks": [...]
  }
]
```

---

### Create Data Source

```http
POST /api/sources
```

**Request Body:**
```json
{
  "name": "Building Management System",
  "type": "API",
  "format": "JSON",
  "updateFrequency": "Real-time"
}
```

**Required fields:**
- `name` (string)
- `type` (enum: EXCEL, API, SURVEY, ERP)

**Optional fields:**
- `format` (string)
- `updateFrequency` (string)

---

### Update Data Source

```http
PUT /api/sources/:id
```

---

### Delete Data Source

```http
DELETE /api/sources/:id
```

---

## Departments

### Get All Departments

```http
GET /api/departments
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Facilities Management",
    "owner": "John Smith",
    "email": "facilities@university.edu",
    "metricLinks": [...]
  }
]
```

---

### Create Department

```http
POST /api/departments
```

**Request Body:**
```json
{
  "name": "Sustainability Office",
  "owner": "Jane Doe",
  "email": "sustainability@university.edu"
}
```

**Required fields:**
- `name` (string)

**Optional fields:**
- `owner` (string)
- `email` (string)

---

### Update Department

```http
PUT /api/departments/:id
```

---

### Delete Department

```http
DELETE /api/departments/:id
```

---

## Storage Locations

### Get All Storage Locations

```http
GET /api/storage
```

**Response:**
```json
[
  {
    "id": 1,
    "locationName": "Google Drive - ESG Data",
    "type": "DRIVE",
    "metricLinks": [...]
  }
]
```

---

### Create Storage Location

```http
POST /api/storage
```

**Request Body:**
```json
{
  "locationName": "SharePoint - Sustainability Reports",
  "type": "SHAREPOINT"
}
```

**Required fields:**
- `locationName` (string)
- `type` (enum: DRIVE, SERVER, CLOUD, SHAREPOINT)

---

### Update Storage Location

```http
PUT /api/storage/:id
```

---

### Delete Storage Location

```http
DELETE /api/storage/:id
```

---

## Metric Links

### Get All Metric Links

```http
GET /api/metric-links
```

**Query Parameters:**
- `metricId` (optional) - Filter by metric ID

---

### Create Metric Link

```http
POST /api/metric-links
```

**Request Body:**
```json
{
  "metricId": 1,
  "sourceId": 2,
  "departmentId": 1,
  "storageId": 3,
  "qualityScore": 85,
  "lastUpdate": "2026-03-01",
  "issues": "Some data missing"
}
```

**Required fields:**
- `metricId` (integer)

**Optional fields:**
- `sourceId` (integer)
- `departmentId` (integer)
- `storageId` (integer)
- `qualityScore` (integer, 0-100)
- `lastUpdate` (date string)
- `issues` (string)

---

### Update Metric Link

```http
PUT /api/metric-links/:id
```

---

### Delete Metric Link

```http
DELETE /api/metric-links/:id
```

---

## Error Responses

All endpoints may return standard HTTP error codes:

**400 Bad Request**
```json
{
  "error": "Failed to create metric",
  "message": "Invalid category value"
}
```

**404 Not Found**
```json
{
  "error": "Metric not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Something went wrong!",
  "message": "Database connection failed"
}
```

---

## Testing with cURL

### Create a new metric
```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Panel Output",
    "category": "E",
    "unit": "kWh",
    "status": "COLLECTED"
  }'
```

### Filter metrics by category
```bash
curl "http://localhost:3000/api/metrics?category=E"
```

### Get metric details
```bash
curl http://localhost:3000/api/metrics/1
```

### Update metric
```bash
curl -X PUT http://localhost:3000/api/metrics/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COLLECTED"
  }'
```

### Delete metric
```bash
curl -X DELETE http://localhost:3000/api/metrics/1
```

---

## Rate Limiting

Not implemented in MVP. Consider adding in production.

## Pagination

Not implemented in MVP. All endpoints return full datasets.

For production, consider implementing:
- `?page=1&limit=20`
- Response includes: `{ data: [...], total: 100, page: 1, pages: 5 }`
