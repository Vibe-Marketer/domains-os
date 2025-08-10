# GoDaddy Domains API - Complete Documentation

## Overview

**API Name:** Domains API  
**Documentation URL:** https://developer.godaddy.com/doc/endpoint/domains  
**Purpose:** Domain-related actions such as purchasing, renewing, or managing domains

## Base URLs

- **OTE Environment (Testing):** https://api.ote-godaddy.com
- **Production Environment:** https://api.godaddy.com

## Important Notes

- Updates to domains generally require the domain to be in an `ACTIVE` status
- Some update actions (such as updating nameservers) on protected and high-value domains requires 2FA which is currently not supported via the API
- The Domains API covers comprehensive domain management, DNS records management, and nameserver management

## API Versions and Sections

The Domains API is organized into several sections:

1. **v1 Endpoints** - Core domain operations
2. **v2 Domains Section** - Enhanced customer-specific domain operations  
3. **v2 Notifications Section** - Domain notification management
4. **Models** - Data structures and schemas

---

## v1 Endpoints

### Domain Listing and Information


**GET /v1/domains**
- Description: Retrieve a list of Domains for the specified Shopper
- Purpose: List all domains owned by a shopper

**GET /v1/domains/{domain}**
- Description: Retrieve details for the specified Domain
- Purpose: Get comprehensive information about a specific domain

**PATCH /v1/domains/{domain}**
- Description: Update details for the specified Domain
- Purpose: Modify domain settings and configuration

**DELETE /v1/domains/{domain}**
- Description: Cancel a purchased domain
- Purpose: Cancel domain registration

### Domain Availability and Suggestions

**GET /v1/domains/available**
- Description: Determine whether or not the specified domain is available for purchase
- Purpose: Check single domain availability

**POST /v1/domains/available**
- Description: Determine whether or not the specified domains are available for purchase
- Purpose: Bulk domain availability checking

**GET /v1/domains/suggest**
- Description: Suggest alternate Domain names based on a seed Domain, a set of keywords, or the shopper's purchase history
- Purpose: Get domain name suggestions

### Domain Purchase and Registration

**POST /v1/domains/purchase**
- Description: Purchase and register the specified Domain
- Purpose: Register a new domain

**GET /v1/domains/purchase/schema/{tld}**
- Description: Retrieve the schema to be submitted when registering a Domain for the specified TLD
- Purpose: Get registration requirements for specific TLD

**POST /v1/domains/purchase/validate**
- Description: Validate the request body using the Domain Purchase Schema for the specified TLD
- Purpose: Validate domain purchase request before submission

### Legal and Compliance

**GET /v1/domains/agreements**
- Description: Retrieve the legal agreement(s) required to purchase the specified TLD and add-ons
- Purpose: Get legal agreements for domain registration

**GET /v1/domains/tlds**
- Description: Retrieves a list of TLDs supported and enabled for sale
- Purpose: List available top-level domains

### Contact Management

**PATCH /v1/domains/{domain}/contacts**
- Description: Update domain contacts
- Purpose: Modify domain contact information

**POST /v1/domains/contacts/validate**
- Description: Validate the request body using the Domain Contact Validation Schema for specified domains
- Purpose: Validate contact information before updating

**POST /v1/domains/{domain}/verifyRegistrantEmail**
- Description: Re-send Contact E-mail Verification for specified Domain
- Purpose: Resend email verification to domain registrant

### DNS Records Management

**PATCH /v1/domains/{domain}/records**
- Description: Add the specified DNS Records to the specified Domain
- Purpose: Add new DNS records to domain

**PUT /v1/domains/{domain}/records**
- Description: Replace all DNS Records for the specified Domain
- Purpose: Replace all DNS records for domain

**GET /v1/domains/{domain}/records/{type}/{name}**
- Description: Retrieve DNS Records for the specified Domain, optionally with the specified Type and/or Name
- Purpose: Get specific DNS records

**PUT /v1/domains/{domain}/records/{type}/{name}**
- Description: Replace all DNS Records for the specified Domain with the specified Type and Name
- Purpose: Replace specific DNS records

**DELETE /v1/domains/{domain}/records/{type}/{name}**
- Description: Delete all DNS Records for the specified Domain with the specified Type and Name
- Purpose: Remove specific DNS records

**PUT /v1/domains/{domain}/records/{type}**
- Description: Replace all DNS Records for the specified Domain with the specified Type
- Purpose: Replace all records of a specific type

### Domain Privacy

**DELETE /v1/domains/{domain}/privacy**
- Description: Submit a privacy cancellation request for the given domain
- Purpose: Cancel domain privacy protection

**POST /v1/domains/{domain}/privacy/purchase**
- Description: Purchase privacy for a specified domain
- Purpose: Add privacy protection to domain

### Domain Lifecycle Management

**POST /v1/domains/{domain}/renew**
- Description: Renew the specified Domain
- Purpose: Extend domain registration period

**POST /v1/domains/{domain}/transfer**
- Description: Purchase and start or restart transfer process
- Purpose: Transfer domain to GoDaddy

---

## v2 Customer-Specific Domain Operations


### Domain Information and Management

**GET /v2/customers/{customerId}/domains/{domain}**
- Description: Retrieve details for the specified Domain
- Purpose: Get comprehensive domain information for specific customer

### Change of Registrant

**DELETE /v2/customers/{customerId}/domains/{domain}/changeOfRegistrant**
- Description: Cancels a pending change of registrant request for a given domain
- Purpose: Cancel registrant change request

**GET /v2/customers/{customerId}/domains/{domain}/changeOfRegistrant**
- Description: Retrieve change of registrant information
- Purpose: Get status of registrant change requests

### DNSSEC Management

**PATCH /v2/customers/{customerId}/domains/{domain}/dnssecRecords**
- Description: Add the specified DNSSEC records to the domain
- Purpose: Add DNSSEC security records

**DELETE /v2/customers/{customerId}/domains/{domain}/dnssecRecords**
- Description: Remove the specified DNSSEC record from the domain
- Purpose: Remove DNSSEC security records

### Nameserver Management

**PUT /v2/customers/{customerId}/domains/{domain}/nameServers**
- Description: Replaces the existing name servers on the domain
- Purpose: Update domain nameservers

### Privacy and Forwarding

**GET /v2/customers/{customerId}/domains/{domain}/privacy/forwarding**
- Description: Retrieve privacy email forwarding settings showing where emails are delivered
- Purpose: Get privacy email forwarding configuration

**PATCH /v2/customers/{customerId}/domains/{domain}/privacy/forwarding**
- Description: Update privacy email forwarding settings to determine how emails are delivered
- Purpose: Configure privacy email forwarding

### Domain Redemption and Renewal

**POST /v2/customers/{customerId}/domains/{domain}/redeem**
- Description: Purchase a restore for the given domain to bring it out of redemption
- Purpose: Restore expired domain from redemption period

**POST /v2/customers/{customerId}/domains/{domain}/renew**
- Description: Renew the specified Domain
- Purpose: Extend domain registration period

### Domain Transfer Management

**POST /v2/customers/{customerId}/domains/{domain}/transfer**
- Description: Purchase and start or restart transfer process
- Purpose: Initiate domain transfer

**GET /v2/customers/{customerId}/domains/{domain}/transfer**
- Description: Query the current transfer status
- Purpose: Check transfer progress

**POST /v2/customers/{customerId}/domains/{domain}/transfer/validate**
- Description: Validate the request body using the Domain Transfer Schema for the specified TLD
- Purpose: Validate transfer request before submission

### Transfer In Operations

**POST /v2/customers/{customerId}/domains/{domain}/transferInAccept**
- Description: Accepts the transfer in
- Purpose: Accept incoming domain transfer

**POST /v2/customers/{customerId}/domains/{domain}/transferInCancel**
- Description: Cancels the transfer in
- Purpose: Cancel incoming domain transfer

**POST /v2/customers/{customerId}/domains/{domain}/transferInRestart**
- Description: Restarts transfer in request from the beginning
- Purpose: Restart failed transfer process

**POST /v2/customers/{customerId}/domains/{domain}/transferInRetry**
- Description: Retries the current transfer in request with supplied Authorization code
- Purpose: Retry transfer with new auth code

### Transfer Out Operations

**POST /v2/customers/{customerId}/domains/{domain}/transferOut**
- Description: Initiate transfer out to another registrar for a .uk domain
- Purpose: Start outbound domain transfer

**POST /v2/customers/{customerId}/domains/{domain}/transferOutAccept**
- Description: Accept transfer out
- Purpose: Approve outbound domain transfer

**POST /v2/customers/{customerId}/domains/{domain}/transferOutReject**
- Description: Reject transfer out
- Purpose: Deny outbound domain transfer

### Domain Forwarding

**DELETE /v2/customers/{customerId}/domains/forwards/{fqdn}**
- Description: Submit a forwarding cancellation request for the given fqdn
- Purpose: Cancel domain forwarding

**GET /v2/customers/{customerId}/domains/forwards/{fqdn}**
- Description: Retrieve the forwarding information for the given fqdn
- Purpose: Get domain forwarding configuration

**PUT /v2/customers/{customerId}/domains/forwards/{fqdn}**
- Description: Modify the forwarding information for the given fqdn
- Purpose: Update domain forwarding settings

**POST /v2/customers/{customerId}/domains/forwards/{fqdn}**
- Description: Create a new forwarding configuration for the given FQDN
- Purpose: Set up domain forwarding

### Domain Registration (v2)

**POST /v2/customers/{customerId}/domains/register**
- Description: Purchase and register the specified Domain
- Purpose: Register new domain (v2 enhanced version)

**GET /v2/customers/{customerId}/domains/register/schema/{tld}**
- Description: Retrieve the schema to be submitted when registering a Domain for the specified TLD
- Purpose: Get registration requirements for specific TLD

**POST /v2/customers/{customerId}/domains/register/validate**
- Description: Validate the request body using the Domain Registration Schema for the specified TLD
- Purpose: Validate domain registration request

### System Information

**GET /v2/domains/maintenances**
- Description: Retrieve a list of upcoming system Maintenances
- Purpose: Get scheduled maintenance information

**GET /v2/domains/maintenances/{maintenanceId}**
- Description: Retrieve the details for an upcoming system Maintenances
- Purpose: Get specific maintenance details

**GET /v2/domains/usage/{yyyymm}**
- Description: Retrieve api usage request counts for a specific year/month. The data is retained for a period of three months
- Purpose: Monitor API usage statistics

### Domain Actions

**GET /v2/customers/{customerId}/domains/{domain}/actions**
- Description: Retrieves a list of the most recent actions for the specified domain
- Purpose: Get domain action history

**DELETE /v2/customers/{customerId}/domains/{domain}/actions/{type}**
- Description: Cancel the most recent user action for the specified domain
- Purpose: Cancel pending domain action

**GET /v2/customers/{customerId}/domains/{domain}/actions/{type}**
- Description: Retrieves the most recent action for the specified domain
- Purpose: Get specific domain action details

---

## v2 Notifications Section


### Domain Notifications

**GET /v2/customers/{customerId}/domains/notifications**
- Description: Retrieve the next domain notification
- Purpose: Get pending domain notifications

**GET /v2/customers/{customerId}/domains/notifications/optIn**
- Description: Retrieve a list of notification types that are opted in
- Purpose: Get current notification preferences

**PUT /v2/customers/{customerId}/domains/notifications/optIn**
- Description: Opt in to receive notifications for the submitted notification types
- Purpose: Configure notification preferences

**GET /v2/customers/{customerId}/domains/notifications/schemas/{type}**
- Description: Retrieve the schema for the notification data for the specified notification type
- Purpose: Get notification data structure

**POST /v2/customers/{customerId}/domains/notifications/{notificationId}/acknowledge**
- Description: Acknowledge a domain notification
- Purpose: Mark notification as read/acknowledged

### Contact Management (v2)

**PATCH /v2/customers/{customerId}/domains/{domain}/contacts**
- Description: Update domain contacts
- Purpose: Modify domain contact information (enhanced v2 version)

---

## Data Models and Schemas

The Domains API includes comprehensive data models that define the structure of requests and responses. These models ensure consistent data formatting and validation across all endpoints.


### Complete List of Data Models

The Domains API includes the following comprehensive set of data models and schemas:

#### Core Domain Models
- **Action** - Domain action information
- **ActionReason** - Reason for domain actions
- **Address** - Address information structure
- **Contact** - Contact information model
- **ContactDomain** - Domain-specific contact model
- **ContactDomainCreate** - Contact creation model
- **ContactRegistrantChange** - Registrant change model
- **DomainDetail** - Comprehensive domain information
- **DomainDetailV2** - Enhanced domain information (v2)
- **DomainSummary** - Basic domain information
- **DomainUpdate** - Domain update model

#### DNS and Records Models
- **ArrayOfDNSRecord** - Collection of DNS records
- **DNSRecord** - Individual DNS record structure
- **DNSRecordCreateType** - DNS record creation type
- **DNSRecordCreateTypeName** - DNS record creation with type and name
- **DomainDnssec** - DNSSEC configuration model
- **DomainNameServerUpdateV2** - Nameserver update model

#### Domain Availability Models
- **DomainAvailableBulk** - Bulk availability check
- **DomainAvailableBulkMixed** - Mixed bulk availability results
- **DomainAvailableError** - Availability check error
- **DomainAvailableResponse** - Availability check response

#### Purchase and Registration Models
- **DomainPurchase** - Domain purchase model
- **DomainPurchaseV2** - Enhanced domain purchase (v2)
- **DomainPurchaseResponse** - Purchase response
- **DomainSuggestion** - Domain name suggestions

#### Transfer Models
- **DomainTransferAuthCode** - Transfer authorization code
- **DomainTransferStatus** - Transfer status information
- **DomainTransferIn** - Inbound transfer model
- **DomainTransferInV2** - Enhanced inbound transfer (v2)

#### Privacy and Forwarding Models
- **DomainPrivacyForwarding** - Privacy forwarding settings
- **DomainPrivacyForwardingUpdate** - Privacy forwarding updates
- **DomainForwarding** - Domain forwarding configuration
- **DomainForwardingCreate** - Domain forwarding creation
- **DomainForwardingMask** - Domain forwarding mask
- **PrivacyPurchase** - Privacy purchase model

#### Lifecycle Management Models
- **DomainRenew** - Domain renewal model
- **DomainRenewV2** - Enhanced domain renewal (v2)
- **DomainRedeemV2** - Domain redemption model
- **RenewalDetails** - Renewal details structure

#### Contact Management Models
- **DomainContacts** - Domain contact information
- **DomainContactsV2** - Enhanced domain contacts (v2)
- **DomainContactsCreateV2** - Contact creation (v2)
- **DomainContactsUpdateV2** - Contact updates (v2)
- **DomainsContactsBulk** - Bulk contact operations

#### Notification Models
- **DomainNotification** - Domain notification structure
- **DomainNotificationType** - Notification type definitions
- **DomainChangeOfRegistrant** - Registrant change notifications

#### Consent and Legal Models
- **Consent** - General consent model
- **ConsentV2** - Enhanced consent (v2)
- **ConsentRedemption** - Redemption consent
- **ConsentDomainUpdate** - Domain update consent
- **ConsentRenew** - Renewal consent
- **LegalAgreement** - Legal agreement structure

#### System and Maintenance Models
- **Maintenance** - System maintenance information
- **MaintenanceDetail** - Detailed maintenance information
- **MaintenanceSystem** - Maintenance system details
- **UsageMonthly** - Monthly usage statistics
- **UsageMonthlyDetail** - Detailed usage statistics

#### Validation and Verification Models
- **VerificationDomainName** - Domain name verification
- **VerificationRealName** - Real name verification
- **VerificationsDomain** - Domain verification collection
- **VerificationsDomainV2** - Enhanced domain verification (v2)
- **RealNameValidation** - Real name validation model

#### Schema and Metadata Models
- **JsonDataType** - JSON data type definitions
- **JsonProperty** - JSON property structure
- **JsonSchema** - JSON schema model
- **TldSummary** - Top-level domain summary

#### Error Handling Models
- **Error** - General error model
- **ErrorField** - Field-specific error
- **ErrorLimit** - Rate limit error
- **ErrorDomainContactsValidate** - Contact validation error
- **ErrorFieldDomainContactsValidate** - Contact validation field error

#### Basic Type Models
- **domain** - Basic domain type definition

---

## Summary

The GoDaddy Domains API provides comprehensive functionality for:

### Domain Management
- Domain registration and purchase
- Domain renewal and redemption
- Domain cancellation
- Domain information retrieval
- Domain availability checking
- Domain suggestions

### DNS Management
- DNS record creation, updating, and deletion
- Bulk DNS record operations
- DNS record retrieval by type and name
- DNSSEC record management

### Nameserver Management
- Nameserver updates and configuration
- Nameserver replacement operations

### Contact Management
- Domain contact information updates
- Contact validation
- Registrant change management
- Email verification

### Transfer Operations
- Domain transfers in and out
- Transfer status monitoring
- Transfer validation
- Authorization code management

### Privacy and Security
- Domain privacy protection
- Privacy email forwarding
- DNSSEC security records

### Domain Forwarding
- Domain forwarding configuration
- Forwarding management and updates

### Notifications and Monitoring
- Domain notification management
- Notification preferences
- System maintenance information
- API usage statistics

### Legal and Compliance
- Legal agreement retrieval
- Consent management
- TLD-specific requirements

This comprehensive API covers all aspects of domain, DNS, and nameserver management through a well-structured RESTful interface with extensive data models for robust integration.

