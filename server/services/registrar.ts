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
  private baseUrl = 'https://api.ote-godaddy.com'; // Use OTE (testing) environment

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private getHeaders() {
    return {
      'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/domains`, {
        headers: this.getHeaders(),
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
      const response = await fetch(`${this.baseUrl}/v1/domains`, {
        headers: this.getHeaders(),
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
      // Use v2 nameserver endpoint for better reliability
      const response = await fetch(`${this.baseUrl}/v2/customers/self/domains/${domainName}/nameServers`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(nameservers),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating GoDaddy nameservers:', error);
      return false;
    }
  }

  // Additional GoDaddy-specific methods based on API documentation
  async checkDomainAvailability(domainName: string): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain: domainName,
        available: Math.random() > 0.5,
        price: Math.floor(Math.random() * 20 + 10) * 100000, // Random price in micro-units
        currency: 'USD'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/domains/available?domain=${encodeURIComponent(domainName)}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GoDaddy availability check error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking GoDaddy domain availability:', error);
      throw error;
    }
  }

  async bulkCheckAvailability(domainNames: string[]): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return domainNames.map(domain => ({
        domain,
        available: Math.random() > 0.5,
        price: Math.floor(Math.random() * 20 + 10) * 100000,
        currency: 'USD'
      }));
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/domains/available`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(domainNames),
      });

      if (!response.ok) {
        throw new Error(`GoDaddy bulk availability check error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk checking GoDaddy domain availability:', error);
      throw error;
    }
  }

  async getDomainSuggestions(query: string): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      const tlds = ['.com', '.net', '.org', '.io', '.co'];
      return tlds.map(tld => `${query}${tld}`);
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/domains/suggest?query=${encodeURIComponent(query)}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GoDaddy suggestions error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting GoDaddy domain suggestions:', error);
      throw error;
    }
  }

  async getDomainInfo(domainName: string): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain: domainName,
        status: 'ACTIVE',
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        nameServers: ['ns1.godaddy.com', 'ns2.godaddy.com']
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/domains/${domainName}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GoDaddy domain info error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting GoDaddy domain info:', error);
      throw error;
    }
  }
}

class NamecheapAPI implements RegistrarAPI {
  private apiKey: string;
  private username: string;
  private baseUrl = 'https://api.namecheap.com/xml.response'; // Production API
  private clientIp = '34.135.154.200'; // Replit's external IP

  constructor(apiKey: string, username: string) {
    this.apiKey = apiKey;
    this.username = username;
  }

  private buildUrl(command: string, additionalParams: Record<string, string> = {}): string {
    const params = new URLSearchParams({
      ApiUser: this.username,
      ApiKey: this.apiKey,
      UserName: this.username,
      Command: command,
      ClientIp: this.clientIp,
      ...additionalParams
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  private parseXmlResponse(xmlText: string): { success: boolean; data?: any; error?: string } {
    try {
      if (xmlText.includes('<ApiResponse Status="OK">')) {
        return { success: true, data: xmlText };
      } else {
        const errorMatch = xmlText.match(/<Error[^>]*>([^<]+)<\/Error>/);
        return { 
          success: false, 
          error: errorMatch ? errorMatch[1] : 'Unknown Namecheap API error' 
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to parse XML response' };
    }
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const url = this.buildUrl('namecheap.domains.getList', { PageSize: '1' });
      const response = await fetch(url);
      const text = await response.text();
      const result = this.parseXmlResponse(text);
      return result.success;
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
      const url = this.buildUrl('namecheap.domains.getList');
      const response = await fetch(url);
      const text = await response.text();
      
      const result = this.parseXmlResponse(text);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const domains: Array<{
        name: string;
        status: string;
        expirationDate: Date;
        registrationDate: Date;
        nameservers: string[];
        registrarDomainId: string;
      }> = [];
      
      // Parse domain information from XML
      const domainMatches = text.match(/<Domain[^>]*>/g);
      if (domainMatches) {
        for (const match of domainMatches) {
          const nameMatch = match.match(/Name="([^"]+)"/);
          const expiresMatch = match.match(/Expires="([^"]+)"/);
          const createdMatch = match.match(/Created="([^"]+)"/);
          const autoRenewMatch = match.match(/AutoRenew="([^"]+)"/);
          
          if (nameMatch && expiresMatch && createdMatch) {
            // Get nameservers for this domain
            const nameservers = await this.getDomainNameservers(nameMatch[1]);
            
            domains.push({
              name: nameMatch[1],
              status: 'active', // Namecheap API doesn't provide detailed status in list
              expirationDate: new Date(expiresMatch[1]),
              registrationDate: new Date(createdMatch[1]),
              nameservers: nameservers,
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

  private async getDomainNameservers(domainName: string): Promise<string[]> {
    if (this.apiKey.startsWith('demo-')) {
      return ['dns1.registrar-servers.com', 'dns2.registrar-servers.com'];
    }

    try {
      const [sld, tld] = domainName.split('.');
      const url = this.buildUrl('namecheap.domains.dns.getList', { SLD: sld, TLD: tld });
      const response = await fetch(url);
      const text = await response.text();
      
      const nameservers: string[] = [];
      const nsMatches = text.match(/<Nameserver>([^<]+)<\/Nameserver>/g);
      if (nsMatches) {
        nsMatches.forEach(match => {
          const ns = match.replace(/<\/?Nameserver>/g, '');
          if (ns) nameservers.push(ns);
        });
      }
      
      return nameservers;
    } catch (error) {
      console.error(`Error getting nameservers for ${domainName}:`, error);
      return [];
    }
  }

  async updateNameservers(domainName: string, nameservers: string[]): Promise<boolean> {
    // Return true for demo credentials (update is simulated)
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      const [sld, tld] = domainName.split('.');
      const nsParams: Record<string, string> = { SLD: sld, TLD: tld };
      
      // Add nameserver parameters (Namecheap requires numbered nameservers)
      nameservers.forEach((ns, index) => {
        nsParams[`Nameserver${index + 1}`] = ns;
      });
      
      const url = this.buildUrl('namecheap.domains.dns.setCustom', nsParams);
      const response = await fetch(url);
      const text = await response.text();
      
      const result = this.parseXmlResponse(text);
      return result.success;
    } catch (error) {
      console.error('Error updating Namecheap nameservers:', error);
      return false;
    }
  }

  // Additional Namecheap-specific methods based on API documentation
  async checkDomainAvailability(domainName: string): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain: domainName,
        available: Math.random() > 0.5,
        premiumName: false
      };
    }

    try {
      const url = this.buildUrl('namecheap.domains.check', { DomainList: domainName });
      const response = await fetch(url);
      const text = await response.text();
      
      const result = this.parseXmlResponse(text);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Parse availability from XML
      const availableMatch = text.match(/Available="([^"]+)"/);
      const premiumMatch = text.match(/PremiumName="([^"]+)"/);
      
      return {
        domain: domainName,
        available: availableMatch ? availableMatch[1] === 'true' : false,
        premiumName: premiumMatch ? premiumMatch[1] === 'true' : false
      };
    } catch (error) {
      console.error('Error checking Namecheap domain availability:', error);
      throw error;
    }
  }

  async getDomainInfo(domainName: string): Promise<any> {
    if (this.apiKey.startsWith('demo-')) {
      return {
        domain: domainName,
        status: 'clientTransferProhibited',
        registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: false
      };
    }

    try {
      const [sld, tld] = domainName.split('.');
      const url = this.buildUrl('namecheap.domains.getInfo', { DomainName: domainName });
      const response = await fetch(url);
      const text = await response.text();
      
      const result = this.parseXmlResponse(text);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Parse domain info from XML (simplified parsing)
      const statusMatch = text.match(/Status="([^"]+)"/);
      const createdMatch = text.match(/CreatedDate="([^"]+)"/);
      const expiresMatch = text.match(/ExpiredDate="([^"]+)"/);
      
      return {
        domain: domainName,
        status: statusMatch ? statusMatch[1] : 'unknown',
        registrationDate: createdMatch ? new Date(createdMatch[1]) : null,
        expirationDate: expiresMatch ? new Date(expiresMatch[1]) : null,
        autoRenew: false // Would need to parse from response
      };
    } catch (error) {
      console.error('Error getting Namecheap domain info:', error);
      throw error;
    }
  }
}

class DynadotAPI implements RegistrarAPI {
  private apiKey: string;
  private baseUrl = 'https://api.dynadot.com/api3.json';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(command: string, additionalParams: Record<string, string> = {}): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      command: command,
      ...additionalParams
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  async testConnection(): Promise<boolean> {
    // Return true for demo credentials to allow testing
    if (this.apiKey.startsWith('demo-')) {
      return true;
    }
    
    try {
      // Use account info endpoint to test connection
      const response = await fetch(this.buildUrl('get_account_info'));
      const data = await response.json();
      return response.ok && (data.GetAccountInfoResponse?.ResponseCode === 0 || data.Response?.ResponseCode === '0');
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
      const response = await fetch(this.buildUrl('list_domain'));
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Dynadot API response:', data);
        throw new Error(`Dynadot API error: ${response.status}`);
      }

      if (!data.ListDomainResponse || data.ListDomainResponse.ResponseCode !== 0) {
        throw new Error(`Dynadot API error: ${data.ListDomainResponse?.ErrorMessage || 'Unknown error'}`);
      }

      const domains: Array<{
        name: string;
        status: string;
        expirationDate: Date;
        registrationDate: Date;
        nameservers: string[];
        registrarDomainId: string;
      }> = [];

      const domainInfos = data.ListDomainResponse?.DomainInfoList || [];
      
      if (Array.isArray(domainInfos)) {
        for (const domain of domainInfos) {
          domains.push({
            name: domain.Name,
            status: domain.Status || 'active',
            expirationDate: new Date(domain.Expiration),
            registrationDate: new Date(domain.Created || domain.Expiration),
            nameservers: domain.NameServerSettings?.NameServer || [],
            registrarDomainId: domain.Name,
          });
        }
      }
      
      return domains;
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
