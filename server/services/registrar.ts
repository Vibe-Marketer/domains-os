import { RegistrarConnection, Domain } from "@shared/schema";

export interface RegistrarAPI {
  testConnection(): Promise<boolean>;
  getDomains(): Promise<Array<{
    name: string;
    status: string;
    expirationDate: Date;
    registrationDate: Date;
    nameservers: string[];
    registrarDomainId: string;
  }>>;
  updateNameservers(domainName: string, nameservers: string[]): Promise<boolean>;
}

class GoDaddyAPI implements RegistrarAPI {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const response = await fetch('https://api.godaddy.com/v1/domains', {
        headers: {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Accept': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('GoDaddy API connection test failed:', error);
      return false;
    }
  }

  async getDomains(): Promise<Array<{
    name: string;
    status: string;
    expirationDate: Date;
    registrationDate: Date;
    nameservers: string[];
    registrarDomainId: string;
  }>> {
    // Return empty array for demo credentials (domains are pre-loaded in storage)
    if (this.apiKey.startsWith('demo-')) {
      return [];
    }
    
    try {
      const response = await fetch('https://api.godaddy.com/v1/domains', {
        headers: {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GoDaddy API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((domain: any) => ({
        name: domain.domain,
        status: domain.status.toLowerCase(),
        expirationDate: new Date(domain.expires),
        registrationDate: new Date(domain.createdAt),
        nameservers: domain.nameServers || [],
        registrarDomainId: domain.domainId?.toString() || domain.domain,
      }));
    } catch (error) {
      console.error('Error fetching GoDaddy domains:', error);
      throw error;
    }
  }

  async updateNameservers(domainName: string, nameservers: string[]): Promise<boolean> {
    // Return true for demo credentials (update is simulated)
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const response = await fetch(`https://api.godaddy.com/v1/domains/${domainName}/records/NS`, {
        method: 'PUT',
        headers: {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nameservers.map(ns => ({ data: ns }))),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating GoDaddy nameservers:', error);
      return false;
    }
  }
}

class NamecheapAPI implements RegistrarAPI {
  private apiKey: string;
  private username: string;

  constructor(apiKey: string, username: string) {
    this.apiKey = apiKey;
    this.username = username;
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const response = await fetch(`https://api.namecheap.com/xml.response?ApiUser=${this.username}&ApiKey=${this.apiKey}&UserName=${this.username}&Command=namecheap.domains.getList&ClientIp=127.0.0.1`);
      const text = await response.text();
      return text.includes('<ApiResponse Status="OK">');
    } catch (error) {
      console.error('Namecheap API connection test failed:', error);
      return false;
    }
  }

  async getDomains(): Promise<Array<{
    name: string;
    status: string;
    expirationDate: Date;
    registrationDate: Date;
    nameservers: string[];
    registrarDomainId: string;
  }>> {
    // Return empty array for demo credentials (domains are pre-loaded in storage)
    if (this.apiKey.startsWith('demo-')) {
      return [];
    }
    
    try {
      const response = await fetch(`https://api.namecheap.com/xml.response?ApiUser=${this.username}&ApiKey=${this.apiKey}&UserName=${this.username}&Command=namecheap.domains.getList&ClientIp=127.0.0.1`);
      const text = await response.text();
      
      // Parse XML response (simplified - would need proper XML parser in production)
      const domains: Array<{
        name: string;
        status: string;
        expirationDate: Date;
        registrationDate: Date;
        nameservers: string[];
        registrarDomainId: string;
      }> = [];
      
      // This is a simplified parser - in production you'd use a proper XML parser
      const domainMatches = text.match(/<Domain[^>]*>/g);
      if (domainMatches) {
        for (const match of domainMatches) {
          const nameMatch = match.match(/Name="([^"]+)"/);
          const expiresMatch = match.match(/Expires="([^"]+)"/);
          const createdMatch = match.match(/Created="([^"]+)"/);
          
          if (nameMatch && expiresMatch && createdMatch) {
            domains.push({
              name: nameMatch[1],
              status: 'active', // Namecheap doesn't provide detailed status in list
              expirationDate: new Date(expiresMatch[1]),
              registrationDate: new Date(createdMatch[1]),
              nameservers: [], // Would need separate API call to get nameservers
              registrarDomainId: nameMatch[1],
            });
          }
        }
      }
      
      return domains;
    } catch (error) {
      console.error('Error fetching Namecheap domains:', error);
      throw error;
    }
  }

  async updateNameservers(domainName: string, nameservers: string[]): Promise<boolean> {
    // Return true for demo credentials (update is simulated)
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const nsParams = nameservers.map((ns, index) => `Nameserver${index + 1}=${ns}`).join('&');
      const response = await fetch(`https://api.namecheap.com/xml.response?ApiUser=${this.username}&ApiKey=${this.apiKey}&UserName=${this.username}&Command=namecheap.domains.dns.setCustom&ClientIp=127.0.0.1&SLD=${domainName.split('.')[0]}&TLD=${domainName.split('.')[1]}&${nsParams}`);
      const text = await response.text();
      return text.includes('<ApiResponse Status="OK">');
    } catch (error) {
      console.error('Error updating Namecheap nameservers:', error);
      return false;
    }
  }
}

class DynadotAPI implements RegistrarAPI {
  private apiKey: string;
  private baseUrl = 'https://api.dynadot.com/restful/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      // Use search endpoint to test connection (non-transactional)
      const response = await fetch(`${this.baseUrl}/domains/example.com/search`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return response.ok && data.code === 200;
    } catch (error) {
      console.error('Dynadot API connection test failed:', error);
      return false;
    }
  }

  async getDomains(): Promise<Array<{
    name: string;
    status: string;
    expirationDate: Date;
    registrationDate: Date;
    nameservers: string[];
    registrarDomainId: string;
  }>> {
    // Return empty array for demo credentials (domains are pre-loaded in storage)
    if (this.apiKey.startsWith('demo-')) {
      return [];
    }
    
    try {
      // Note: Dynadot RESTful API doesn't have a direct list_domains endpoint in v1
      // We'll need to use the account/domains endpoint when available
      // For now, return empty array for real API calls until full domain listing is implemented
      console.log('Dynadot domain listing not yet implemented - using pre-loaded demo data');
      return [];
    } catch (error) {
      console.error('Error fetching Dynadot domains:', error);
      throw error;
    }
  }

  async updateNameservers(domainName: string, nameservers: string[]): Promise<boolean> {
    // Return true for demo credentials (update is simulated)
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      // Using RESTful API for nameserver updates
      // This would require implementing the proper DNS management endpoints
      console.log(`Dynadot nameserver update for ${domainName} not yet fully implemented`);
      return false;
    } catch (error) {
      console.error('Error updating Dynadot nameservers:', error);
      return false;
    }
  }

  // Additional Dynadot-specific methods based on API documentation
  async searchDomain(domainName: string, showPrice: boolean = false, currency: string = 'USD'): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain_name: domainName,
        available: 'yes',
        premium: 'no'
      };
    }

    try {
      const url = new URL(`${this.baseUrl}/domains/${domainName}/search`);
      if (showPrice) url.searchParams.append('show_price', 'true');
      if (currency) url.searchParams.append('currency', currency);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dynadot search API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching Dynadot domain:', error);
      throw error;
    }
  }

  async bulkSearchDomains(domainNames: string[]): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain_result_list: domainNames.map(name => ({
          domain_name: name,
          available: Math.random() > 0.5 ? 'yes' : 'no'
        }))
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/domains/bulk_search`, {
        method: 'GET', // Based on documentation, this is a GET request with query params
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dynadot bulk search API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk searching Dynadot domains:', error);
      throw error;
    }
  }
}

export function createRegistrarAPI(connection: RegistrarConnection): RegistrarAPI {
  switch (connection.registrar) {
    case 'godaddy':
      return new GoDaddyAPI(connection.apiKey, connection.apiSecret || '');
    case 'namecheap':
      return new NamecheapAPI(connection.apiKey, connection.apiSecret || '');
    case 'dynadot':
      return new DynadotAPI(connection.apiKey);
    default:
      throw new Error(`Unsupported registrar: ${connection.registrar}`);
  }
}
