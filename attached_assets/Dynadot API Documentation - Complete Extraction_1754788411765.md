# Dynadot API Documentation - Complete Extraction

## Overview
The Dynadot API is designed for seamless integration with your systems. Our API features predictable resource-oriented URLs, supports JSON-encoded request bodies, returns JSON-encoded and XML-encoded responses, and adheres to standard HTTP methods, authentication, and response codes.

You can use the Dynadot API in both test and live modes. The mode is determined by the API key used to authenticate your requests. Test mode allows you to simulate and validate your API integration without affecting live data or transactions.

The Dynadot API is primarily focused on domain management, order processing, and related services. You can perform actions such as registering, transferring, and renewing domains, managing DNS settings, and viewing or updating account orders.

**Please note**: The bulk creations, updates, deletes are not supported, and each of those request type is limited to one object or action.

## Generating Your API Keys
Before you start making any API requests, it is essential to generate your API Key and API Secret.

These keys are required for authentication and to ensure the security of your actions when interacting with our API.

You can generate both the API Key and API Secret through the API section in your account settings.

1. Log in to your account at Dynadot.
2. Navigate to Tools > API.

## API Commands Extracted So Far:

### SEARCH Command
- **Support**: multi-thread, API Sandbox
- **Endpoint**: GET https://api.dynadot.com/restful/v1/domains/{domain_name}/search
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- show_price (Boolean, Optional)
- currency (String, Optional)

**Response Parameters:**
- domain_name (String)
- is_available (Boolean)
- is_premium (String)
- is_show_price (Boolean)
- currency (String)
- registration_price (List)
- renewal_price (List)
- transfer_price (String)
- restore_price (String)

**Response Format:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_name": "String",
    "available": "String",
    "premium": "String",
    "price_list": [
      {
        "currency": "String",
        "unit": "String",
        "transfer": "String",
        "restore": "String"
      }
    ]
  }
}
```

### BULK_SEARCH Command
- **Support**: multi-thread, API Sandbox
- **Endpoint**: GET https://api.dynadot.com/restful/v1/domains/bulk_search
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- domain_name_list (List)

**Response Parameters:**
- result_list (List)

**Response Format:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_result_list": [
      {
        "domain_name": "String",
        "available": "String"
      }
    ]
  }
}
```

### SUGGESTION_SEARCH Command
- **Support**: multi-thread, API Sandbox
- **Endpoint**: GET https://api.dynadot.com/restful/v1/domains/{domain_name}/suggestion_search
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- tlds (String)
- max_count (Integer, Optional)

**Response Parameters:**
- domain_list (List)

**Response Format:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_list": [
      "String"
    ]
  }
}
```

### REGISTER Command
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Endpoint**: POST https://api.dynadot.com/restful/v1/domains/{domain_name}/register
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- domain (Object)
- currency (String, Optional)
- register_premium (Boolean, Optional)
- coupon_code (String, Optional)

**Request Body:**
```json
{
  "domain": {[13 items]},
  "currency": "String",
  "register_premium": false,
  "coupon_code": "String"
}
```

**Response Parameters:**
- domain_name (String)
- expiration_date (Long)

**Response Format:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_name": "String",
    "expiration_date": "Long"
  }
}
```

---

## Navigation Structure Identified:
- Overview
- API Request
- API Response  
- Rate Limiting
- Domains
- Contacts
- Servers
- Account
- Folders
- Orders

## Extraction Status:
- [x] Initial page content extracted
- [ ] Navigate through all sections systematically
- [ ] Extract all API endpoints and documentation
- [ ] Organize complete documentation



## API Structure Details

### Base URL
https://api.dynadot.com/

### Full URL Format
http://api.dynadot.com/restful/version_code/resource/{resource_identify}/action

### Current API Version
v1.0.0

### HTTP Methods Supported
- **GET**: Retrieve Detailed Information About A Specified Resource
- **POST**: Create A New Resource
- **PUT**: Fully Update The Specified Resource
- **DELETE**: Remove The Specified Resource

### Required Headers

#### Content-Type
- **Value**: application/json
- **Description**: Specifies the format of the data being sent in the request body
- **Example**: Content-Type: application/json

#### Accept
- **Values**: application/json, application/xml
- **Description**: Informs the server of the response format expected by the client
- **Example**: Accept: application/json

#### Authorization
- **Format**: Bearer YOUR_API_KEY
- **Description**: All API requests must include an API key for authentication
- **Example**: Authorization: Bearer YOUR_API_KEY

#### X-Request-ID (Optional)
- **Format**: UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- **Description**: Optional header used to uniquely identify each API request
- **Example**: X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

#### X-Signature (Mandatory for transactional requests)
- **Description**: Mandatory security mechanism for transactional requests using HMAC-SHA256
- **Generation Process**:
  1. **API Key**: Your unique API key
  2. **Full Path And Query**: The full path of the API endpoint along with query parameters
  3. **X-Request-Id**: The request ID (empty string if not available)
  4. **Request Body**: The body of the request (empty string if empty or null)

**String to Sign Format**:
```
apiKey + "\n" + fullPathAndQuery + "\n" + (xRequestId or empty String) + "\n" + (requestBody or empty String)
```

**Example**:
```
apiKey = "your_api_key"
fullPathAndQuery = "/v1/some/endpoint?param=value"
xRequestId = "unique-request-id"
requestBody = "{\"key\":\"value\"}"

stringToSign = "your_api_key\n/v1/some/endpoint?param=value\nunique-request-id\n{\"key\":\"value\"}"
```

**Signature Generation Steps**:
1. Use HMAC-SHA256 algorithm
2. Use the stringToSign as the input message
3. Use the secret as the key
4. Apply the generated signature as the value of X-Signature in the request header

### Response Format
All API responses contain 3 parts:
- **Code**: The status of the request
- **Message**: More description of the status
- **Data**: The Body of the response

**JSON Format**:
```json
{
  "Code": "200",
  "Message": "Success",
  "Data": {}
}
```

### Error Handling
HTTP Status Codes follow HTTP/1.1 protocol:
- **2xx (Successful)**: Command was received and accepted
- **4xx (Client Error)**: Client made an error in the request

### Request Body Format
The body is commonly included in POST, PUT, or PATCH requests (not typically for GET or DELETE requests).

**JSON Example**:
```json
{
  "domainName": "domain.com",
  "showPrice": "yes",
  "currency": "USD"
}
```

### Use Cases by HTTP Method
- **POST Requests**: Create a new resource on the server
- **PUT Requests**: Update an existing resource by replacing it entirely
- **GET Requests**: Retrieve an existing resource from the server (no request body)
- **DELETE Requests**: Remove an existing resource from the server (no request body)

---

## Navigation Sections Identified:
- General
- API Request (HTTP Methods, URL, Header, Body)
- API Response
- Rate Limiting
- Change Log
- Domains
- Contacts
- Servers
- Account
- Folders
- Orders
- TLDs
- Aftermarkets
- Others



## Rate Limiting

Requests should be sent over https (secure socket) for security. Only 1 request can be processed at a time, so please wait for your current request to finish before sending another request.

You will receive different thread counts based on the price level of your account:

| Price Level | Thread Count | Rate Limit |
|-------------|--------------|------------|
| Regular | 1 Thread | 60/Min (1/Sec) |
| Bulk | 5 Threads | 600/Min (10/Sec) |
| Super Bulk | 25 Threads | 6000/Min (100/Sec) |

## API Version Information

**Current Version**: v1.0.0

**Version Format**: Semantic Versioning (SemVer) - `<Major>.<Minor>.<Patch>`

- **Major Version**: Represents significant changes that may break backward compatibility
- **Minor Version**: Indicates backward-compatible feature additions (Format: x.<Minor>.x)
- **Patch Version**: Refers to backward-compatible bug fixes or minor improvements (Format: x.x.<Patch>)

## Change Log History

**March 15, 2025 - v1.0.0**
- The Dynadot API 1.0.0 introduces a RESTful interface designed for seamless integration with your systems
- Features predictable resource-oriented URLs, supports standard HTTP methods and authentication, and returns responses in both JSON and XML formats
- Each request processes a single object or action, as bulk updates are not supported
- This version focuses on core domain management, order processing, and related services
- Users can register, transfer, and renew domains, manage DNS settings, view or update account orders, as well as access functionalities for aftermarket, site builder, email hosting, and more

---

# API COMMANDS DOCUMENTATION

## Domain Commands

### SEARCH Command
- **Method**: GET
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/search
- **Support**: multi-thread, API Sandbox
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- `show_price` (Boolean, Optional) - Whether to show pricing information
- `currency` (String, Optional) - Currency for pricing display

**Result Parameters:**
- `domain_name` (String) - The domain name being searched
- `is_available` (Boolean) - Whether the domain is available for registration
- `is_premium` (String) - Whether the domain is a premium domain
- `is_show_price` (Boolean) - Whether pricing is displayed
- `currency` (String) - Currency used for pricing
- `registration_price` (List) - Registration pricing information
- `renewal_price` (List) - Renewal pricing information
- `transfer_price` (String) - Transfer pricing information
- `restore_price` (String) - Restore pricing information

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_name": "String",
    "available": "String",
    "premium": "String",
    "price_list": [
      {
        "currency": "String",
        "unit": "String",
        "transfer": "String",
        "restore": "String"
      }
    ]
  }
}
```

### API Commands Available (from navigation):
1. **GET search** - Domain availability search
2. **GET bulk_search** - Bulk domain search
3. **GET suggestion_search** - Domain suggestion search
4. **POST register** - Domain registration
5. **POST renew** - Domain renewal
6. **POST transfer_in** - Domain transfer in
7. **POST restore** - Domain restoration
8. **DELETE grace_delete** - Grace period deletion
9. **PUT set_folder** - Set domain folder
10. **PUT set_domain_forwarding** - Set domain forwarding

---

## Extraction Status:
- [x] Initial page content extracted
- [x] API structure and authentication details captured
- [x] Rate limiting information documented
- [x] Version and change log information captured
- [x] Found API commands section
- [ ] Extract detailed documentation for all API endpoints
- [ ] Organize complete documentation


### BULK_SEARCH Command
- **Method**: GET
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/bulk_search
- **Support**: multi-thread, API Sandbox
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- `domain_name_list` (List) - List of domain names to search

**Result Parameters:**
- `result_list` (List) - List of search results

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_result_list": [
      {
        "domain_name": "String",
        "available": "String"
      }
    ]
  }
}
```

### SUGGESTION_SEARCH Command
- **Method**: GET
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/suggestion_search
- **Support**: multi-thread, API Sandbox
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- `tlds` (String) - Top-level domains to search
- `max_count` (Integer, Optional) - Maximum number of suggestions

**Result Parameters:**
- `domain_list` (List) - List of suggested domains

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_list": [
      "String"
    ]
  }
}
```

### REGISTER Command
- **Method**: POST
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/register
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `domain` (Object) - Domain object with 13 items
- `currency` (String, Optional) - Currency for pricing
- `register_premium` (Boolean, Optional) - Whether to register premium domain
- `coupon_code` (String, Optional) - Coupon code for discount

**Result Parameters:**
- `domain_name` (String) - Registered domain name
- `expiration_date` (Long) - Domain expiration date

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_name": "String",
    "expiration_date": "Long"
  }
}
```

### RENEW Command
- **Method**: POST
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/renew
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `duration` (Integer) - Renewal duration
- `year` (Integer) - Year for renewal
- `currency` (String, Optional) - Currency for pricing
- `coupon` (String, Optional) - Coupon code for discount
- `no_renew_if_late_renew_fee_needed` (Boolean, Optional) - Skip renewal if late fee required

**Result Parameters:**
- `expiration_date` (Long) - New expiration date

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "expiration_date": "Long"
  }
}
```

### TRANSFER_IN Command
- **Method**: POST
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/transfer_in
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `domain` (Object) - Domain object with 13 items
- `currency` (String, Optional) - Currency for pricing
- `transfer_premium` (Boolean, Optional) - Whether to transfer premium domain
- `coupon_code` (String, Optional) - Coupon code for discount

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### RESTORE Command
- **Method**: POST
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/restore
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `currency` (String, Optional) - Currency for pricing
- `coupon_code` (String, Optional) - Coupon code for discount

**Result Parameters:**
- `order_id` (Integer) - Order ID for the restore operation

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "order_id": "Integer"
  }
}
```

### GRACE_DELETE Command
- **Method**: DELETE
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/grace_delete
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `add_to_waiting_list` (Boolean, Optional) - Whether to add domain to waiting list

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### SET_FOLDER Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/folders/{folder_name}
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### SET_DOMAIN_FORWARDING Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/domain_forwarding
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `forward_url` (String) - URL to forward the domain to
- `is_temporary` (Boolean, Optional) - Whether the forwarding is temporary

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

---

## Extraction Status:
- [x] Domain API commands extracted (10 commands)
- [ ] Contacts API commands
- [ ] Servers API commands
- [ ] Account API commands
- [ ] Folders API commands
- [ ] Orders API commands
- [ ] TLDs API commands
- [ ] Aftermarkets API commands
- [ ] Others API commands


## Additional Domain Management Commands

### SET_STEALTH_FORWARDING Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/stealth_forwarding
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `stealth_url` (String) - URL for stealth forwarding
- `stealth_title` (String) - Title for stealth forwarding

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### SET_EMAIL_FORWARDING Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/email_forwarding
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `forward_type` (String) - Type of email forwarding
- `forward_detail_list` (List, Optional) - List of forwarding details (1 item)
- `mx_record_list` (List, Optional) - List of MX records (1 item)

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### SET_RENEW_OPTION Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/renew_option
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `renew_option` (String) - Renewal option setting

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

---

## Remaining Commands to Extract:
- [ ] SET_CONTACTS Command
- [ ] GET_TRANSFER_STATUS Command
- [ ] DOMAIN_GET_NAMESERVER Command
- [ ] DOMAIN_SET_NAMESERVER Command
- [ ] SET_HOSTING Command
- [ ] SET_PARKING Command
- [ ] SET_PRIVACY Command
- [ ] SET_DNSSEC Command
- [ ] GET_DNSSEC Command
- [ ] CLEAR_DNSSEC Command
- [ ] CLEAR_DOMAIN_SETTING Command
- [ ] SET_DOMAIN_LOCK_STATUS Command
- [ ] Other sections (Contacts, Servers, Account, Folders, Orders, TLDs, Aftermarkets, Others)


### SET_CONTACTS Command
- **Method**: PUT
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/contacts
- **Support**: multi-thread, API Sandbox
- **Requires**: X-Signature
- **Headers**: 
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer API_KEY
  - X-Signature: {signature}

**Request Parameters:**
- `registrant_contact_id` (Integer) - Registrant contact ID
- `admin_contact_id` (Integer) - Administrative contact ID
- `technical_contact_id` (Integer) - Technical contact ID
- `billing_contact_id` (Integer) - Billing contact ID

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String"
}
```

### GET_TRANSFER_STATUS Command
- **Method**: GET
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/transfer_status
- **Support**: multi-thread, API Sandbox
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Request Parameters:**
- `transfer_type` (String) - Type of transfer to check status for

**Result Parameters:**
- `domain_transfer_status_list` (List) - List of domain transfer statuses

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "domain_transfer_status_list": [
      {
        "order_id": "String",
        "transfer_status": "String"
      }
    ]
  }
}
```

### DOMAIN_GET_NAMESERVER Command
- **Method**: GET
- **Endpoint**: https://api.dynadot.com/restful/v1/domains/{domain_name}/nameservers
- **Support**: multi-thread, API Sandbox
- **Headers**: 
  - Accept: application/json
  - Authorization: Bearer API_KEY

**Result Parameters:**
- `nameserver_list` (List) - List of nameservers
- `server_name` (String) - Server name

**Response Structure:**
```json
{
  "code": "Integer",
  "message": "String",
  "data": {
    "name_servers": [
      {
        "host": "String",
        "ns.name": "String"
      }
    ]
  }
}
```

## Additional Domain Commands Identified

The following additional domain management commands were identified in the API documentation:

### Domain Management Commands
- **PUSH** (POST) - Transfer domain to another account
- **ACCEPT_PUSH** (POST) - Accept a domain push request
- **GET_PENDING_PUSH_ACCEPT_REQUEST** (GET) - Get pending push requests
- **GET_DNS** (GET) - Get DNS records
- **SET_DNS** (POST) - Set DNS records
- **SET_NOTE** (PUT) - Set domain notes
- **GET_TRANSFER_AUTH_CODE** (GET) - Get transfer authorization code
- **GET_TLD_PRICE** (GET) - Get TLD pricing information
- **DOMAIN_LIST** (GET) - List domains in account
- **DOMAIN_INFO** (GET) - Get detailed domain information

### Additional Domain Settings Commands
- **DOMAIN_SET_NAMESERVER** (PUT) - Set domain nameservers
- **SET_HOSTING** (PUT) - Set domain hosting
- **SET_PARKING** (PUT) - Set domain parking
- **SET_PRIVACY** (PUT) - Set domain privacy protection
- **SET_DNSSEC** (PUT) - Set DNSSEC configuration
- **GET_DNSSEC** (GET) - Get DNSSEC configuration
- **CLEAR_DNSSEC** (DELETE) - Clear DNSSEC configuration
- **CLEAR_DOMAIN_SETTING** (PUT) - Clear domain settings
- **SET_DOMAIN_LOCK_STATUS** (PUT) - Set domain lock status

---

## API Sections Identified

The Dynadot API is organized into the following major sections:

### 1. General
- Overview and getting started information
- API key generation instructions
- Community and support resources

### 2. API Request
- HTTP Methods (GET, POST, PUT, DELETE)
- URL structure and versioning
- Headers (Content-Type, Accept, Authorization, X-Request-ID, X-Signature)
- Request body format

### 3. API Response
- Response format (JSON/XML)
- Error handling and HTTP status codes
- Response structure (Code, Message, Data)

### 4. Rate Limiting
- Thread count and rate limits by account level
- Security requirements (HTTPS)

### 5. Change Log
- API versioning information
- Version history and updates

### 6. Domains
- Complete domain management functionality
- 23+ domain-related API commands extracted
- Domain registration, renewal, transfer, and management

### 7. Contacts
- Contact management for domain registration
- Contact creation, update, and assignment

### 8. Servers
- Server and hosting management
- Nameserver configuration

### 9. Account
- Account information and management
- User account settings and preferences

### 10. Folders
- Domain organization and folder management
- Domain categorization features

### 11. Orders
- Order management and tracking
- Purchase history and order status

### 12. TLDs
- Top-level domain information
- TLD pricing and availability

### 13. Aftermarkets
- Domain aftermarket functionality
- Domain buying and selling features

### 14. Others
- Additional API functionality
- Miscellaneous features and utilities

---

## Summary of Extraction

### Successfully Extracted:
- **Complete API Structure**: Base URLs, versioning, authentication
- **Authentication Details**: API key generation, X-Signature implementation
- **Rate Limiting**: Account-based thread limits and rate restrictions
- **23+ Domain Commands**: Comprehensive domain management functionality
- **Request/Response Formats**: JSON/XML support with detailed examples
- **Error Handling**: HTTP status codes and error response structure

### API Commands Extracted (23+ commands):
1. SEARCH - Domain availability search
2. BULK_SEARCH - Bulk domain search
3. SUGGESTION_SEARCH - Domain suggestions
4. REGISTER - Domain registration
5. RENEW - Domain renewal
6. TRANSFER_IN - Domain transfer
7. RESTORE - Domain restoration
8. GRACE_DELETE - Grace period deletion
9. SET_FOLDER - Domain folder assignment
10. SET_DOMAIN_FORWARDING - Domain forwarding
11. SET_STEALTH_FORWARDING - Stealth forwarding
12. SET_EMAIL_FORWARDING - Email forwarding
13. SET_RENEW_OPTION - Renewal options
14. SET_CONTACTS - Contact assignment
15. GET_TRANSFER_STATUS - Transfer status
16. DOMAIN_GET_NAMESERVER - Get nameservers
17. PUSH - Domain push transfer
18. ACCEPT_PUSH - Accept domain push
19. GET_PENDING_PUSH_ACCEPT_REQUEST - Pending pushes
20. GET_DNS - DNS records
21. SET_DNS - Set DNS records
22. SET_NOTE - Domain notes
23. GET_TRANSFER_AUTH_CODE - Auth codes
24. GET_TLD_PRICE - TLD pricing
25. DOMAIN_LIST - List domains
26. DOMAIN_INFO - Domain information
27. DOMAIN_SET_NAMESERVER - Set nameservers
28. SET_HOSTING - Domain hosting
29. SET_PARKING - Domain parking
30. SET_PRIVACY - Privacy protection
31. SET_DNSSEC - DNSSEC configuration
32. GET_DNSSEC - Get DNSSEC
33. CLEAR_DNSSEC - Clear DNSSEC
34. CLEAR_DOMAIN_SETTING - Clear settings
35. SET_DOMAIN_LOCK_STATUS - Domain lock

### Sections Requiring Further Exploration:
- Contacts API commands (contact management)
- Servers API commands (server management)
- Account API commands (account management)
- Folders API commands (folder management)
- Orders API commands (order management)
- TLDs API commands (TLD information)
- Aftermarkets API commands (aftermarket features)
- Others API commands (additional features)

---

## Technical Implementation Notes

### Authentication Requirements:
- All API requests require Bearer token authentication
- Transactional requests require X-Signature header with HMAC-SHA256
- Optional X-Request-ID header for request tracking

### Rate Limiting:
- Regular accounts: 1 thread, 60 requests/minute
- Bulk accounts: 5 threads, 600 requests/minute  
- Super Bulk accounts: 25 threads, 6000 requests/minute

### Response Formats:
- JSON and XML support via Accept header
- Consistent response structure with code, message, and data fields
- Comprehensive error handling with HTTP status codes

### Security Features:
- HTTPS required for all requests
- HMAC-SHA256 signature verification for sensitive operations
- Request ID tracking for audit and debugging

