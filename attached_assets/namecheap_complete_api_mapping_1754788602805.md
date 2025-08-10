# Namecheap Complete API Documentation Mapping

## API Overview
- **Base URL (Production)**: https://api.namecheap.com/xml.response
- **Base URL (Sandbox)**: https://api.sandbox.namecheap.com/xml.response
- **Authentication**: UserName, ApiUser, ApiKey, ClientIp
- **Response Format**: XML

## Complete API Services and Methods

### 1. Domains API (namecheap.domains.*)

#### Core Domain Operations:
- **domains.getList** - Returns a list of domains for the particular user
- **domains.getInfo** - Gets information about the requested domain
- **domains.check** - Checks domain name availability
- **domains.create** - Registers a new domain
- **domains.getTldList** - Returns a list of TLDs
- **domains.getContacts** - Gets contact information of the requested domain

### 2. Domains DNS API (namecheap.domains.dns.*)

#### DNS Management:
- **domains.dns.getHosts** - Gets DNS host records settings for the requested domain
- **domains.dns.getList** - Gets a list of DNS servers associated with the requested domain
- **domains.dns.setHosts** - Sets DNS host records settings for the requested domain
- **domains.dns.setCustom** - Sets domain to use custom DNS servers
- **domains.dns.setDefault** - Sets domain to use Namecheap's default DNS servers

### 3. Domains Nameserver API (namecheap.domains.ns.*)

#### Nameserver Management:
- **domains.ns.create** - Creates a new nameserver
- **domains.ns.delete** - Deletes a nameserver associated with the requested domain
- **domains.ns.getInfo** - Retrieves information about a registered nameserver
- **domains.ns.update** - Updates the IP address of a registered nameserver

### 4. Domains Transfer API (namecheap.domains.transfer.*)

#### Domain Transfer Operations:
- **domains.transfer.create** - Transfers a domain to NameCheap
- **domains.transfer.getStatus** - Gets the status of a particular transfer
- **domains.transfer.updateStatus** - Updates the status of a particular transfer
- **domains.transfer.getList** - Gets the list of domain transfers
- **domains.transfer.getEpp** - Requests the EPP Code for the given domain

### 5. SSL API (namecheap.ssl.*)

#### SSL Certificate Management:
- **ssl.activate** - Activates a newly purchased SSL certificate
- **ssl.getInfo** - Retrieves information about the requested SSL certificate
- **ssl.parseCsr** - Parses the CSR
- **ssl.getApproverEmailList** - Gets approver email list for the requested domain
- **ssl.getList** - Returns a list of SSL certificates for a particular user
- **ssl.create** - Creates a new SSL certificate
- **ssl.resendApproverEmail** - Resends the approver email
- **ssl.resendFulfillmentEmail** - Resends the fulfillment email containing the certificate

### 6. Users API (namecheap.users.*)

#### User Account Management:
- **users.create** - Creates a new user account at NameCheap
- **users.getPricing** - Returns pricing information for a requested product type
- **users.getBalances** - Gets information about fund in the user's account
- **users.changePassword** - Changes password of the particular user's account
- **users.update** - Updates user account information for the particular user
- **users.createAddFundsRequest** - Creates a request to add funds through a credit card
- **users.getAddFundsStatus** - Gets the status of add funds request
- **users.login** - Validates the username and password of user accounts
- **users.resetPassword** - Sends password reset email to user

### 7. Users Address API (namecheap.users.address.*)

#### User Address Management:
- **users.address.create** - Creates a new address for the user
- **users.address.update** - Updates an existing address for the user
- **users.address.delete** - Deletes an address for the user
- **users.address.getList** - Gets a list of addresses for the user
- **users.address.getInfo** - Gets information about a specific address
- **users.address.setDefault** - Sets an address as the default address

## API Categories Summary

1. **Domain Management** (8 methods)
2. **DNS Management** (5 methods)
3. **Nameserver Management** (4 methods)
4. **Domain Transfer** (5 methods)
5. **SSL Certificate Management** (8 methods)
6. **User Account Management** (9 methods)
7. **User Address Management** (6 methods)

**Total API Methods**: 45 methods across 7 main service categories

## Authentication Parameters (Required for all API calls)
- **ApiUser** - Username required to access the API
- **ApiKey** - Password required to access the API
- **UserName** - The Username on which a command is executed
- **ClientIp** - IP address of the client accessing the API
- **Command** - The specific API command to execute

## Global Parameters
- All API calls return XML responses
- Sandbox environment available for testing
- Rate limiting may apply
- HTTPS required for all API calls

