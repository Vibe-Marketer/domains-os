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

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.dynadot.com/api3.json?key=${this.apiKey}&command=list_domain`);
      const data = await response.json();
      return data.status === 'success';
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
    try {
      const response = await fetch(`https://api.dynadot.com/api3.json?key=${this.apiKey}&command=list_domain`);
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(`Dynadot API error: ${data.error || 'Unknown error'}`);
      }

      const domains = data.domains || [];
      return domains.map((domain: any) => ({
        name: domain.name,
        status: domain.status?.toLowerCase() || 'active',
        expirationDate: new Date(domain.expiration * 1000), // Unix timestamp
        registrationDate: new Date(domain.registration * 1000), // Unix timestamp
        nameservers: domain.name_servers || [],
        registrarDomainId: domain.name,
      }));
    } catch (error) {
      console.error('Error fetching Dynadot domains:', error);
      throw error;
    }
  }

  async updateNameservers(domainName: string, nameservers: string[]): Promise<boolean> {
    try {
      const nsParams = nameservers.map((ns, index) => `ns${index}=${ns}`).join('&');
      const response = await fetch(`https://api.dynadot.com/api3.json?key=${this.apiKey}&command=set_ns&domain=${domainName}&${nsParams}`);
      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      console.error('Error updating Dynadot nameservers:', error);
      return false;
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
