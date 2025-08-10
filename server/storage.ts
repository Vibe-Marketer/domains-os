import { type User, type InsertUser, type Domain, type InsertDomain, type RegistrarConnection, type InsertRegistrarConnection, type DomainWithConnection, type UpdateNameservers } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Registrar connection methods
  getRegistrarConnections(userId: string): Promise<RegistrarConnection[]>;
  createRegistrarConnection(connection: InsertRegistrarConnection): Promise<RegistrarConnection>;
  updateRegistrarConnection(id: string, updates: Partial<RegistrarConnection>): Promise<RegistrarConnection | undefined>;
  deleteRegistrarConnection(id: string): Promise<boolean>;

  // Domain methods
  getDomains(userId: string, filters?: { registrar?: string; status?: string; search?: string }): Promise<DomainWithConnection[]>;
  getDomain(id: string): Promise<DomainWithConnection | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined>;
  updateDomainNameservers(domainId: string, nameservers: string[]): Promise<Domain | undefined>;
  deleteDomain(id: string): Promise<boolean>;
  bulkUpdateDomains(domainIds: string[], updates: Partial<Domain>): Promise<Domain[]>;

  // Statistics
  getDomainStats(userId: string): Promise<{
    totalDomains: number;
    expiringSoon: number;
    activeDomains: number;
    thisMonth: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private registrarConnections: Map<string, RegistrarConnection>;
  private domains: Map<string, Domain>;

  constructor() {
    this.users = new Map();
    this.registrarConnections = new Map();
    this.domains = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRegistrarConnections(userId: string): Promise<RegistrarConnection[]> {
    return Array.from(this.registrarConnections.values()).filter(
      (connection) => connection.userId === userId
    );
  }

  async createRegistrarConnection(connection: InsertRegistrarConnection): Promise<RegistrarConnection> {
    const id = randomUUID();
    const newConnection: RegistrarConnection = {
      ...connection,
      id,
      apiSecret: connection.apiSecret || null,
      isActive: connection.isActive ?? true,
      lastSync: null,
      createdAt: new Date(),
    };
    this.registrarConnections.set(id, newConnection);
    return newConnection;
  }

  async updateRegistrarConnection(id: string, updates: Partial<RegistrarConnection>): Promise<RegistrarConnection | undefined> {
    const connection = this.registrarConnections.get(id);
    if (!connection) return undefined;

    const updated = { ...connection, ...updates };
    this.registrarConnections.set(id, updated);
    return updated;
  }

  async deleteRegistrarConnection(id: string): Promise<boolean> {
    return this.registrarConnections.delete(id);
  }

  async getDomains(userId: string, filters?: { registrar?: string; status?: string; search?: string }): Promise<DomainWithConnection[]> {
    const userDomains = Array.from(this.domains.values()).filter(
      (domain) => domain.userId === userId
    );

    let filteredDomains = userDomains;

    if (filters?.registrar) {
      filteredDomains = filteredDomains.filter(d => d.registrar === filters.registrar);
    }

    if (filters?.status) {
      filteredDomains = filteredDomains.filter(d => d.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredDomains = filteredDomains.filter(d => 
        d.name.toLowerCase().includes(searchLower)
      );
    }

    return filteredDomains.map(domain => {
      const connection = this.registrarConnections.get(domain.registrarConnectionId);
      return {
        ...domain,
        registrarConnection: connection!,
      };
    });
  }

  async getDomain(id: string): Promise<DomainWithConnection | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;

    const connection = this.registrarConnections.get(domain.registrarConnectionId);
    if (!connection) return undefined;

    return {
      ...domain,
      registrarConnection: connection,
    };
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const id = randomUUID();
    const newDomain: Domain = {
      ...domain,
      id,
      nameservers: domain.nameservers || [],
      autoRenew: domain.autoRenew ?? false,
      registrarDomainId: domain.registrarDomainId || null,
      lastUpdated: new Date(),
    };
    this.domains.set(id, newDomain);
    return newDomain;
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;

    const updated = { ...domain, ...updates, lastUpdated: new Date() };
    this.domains.set(id, updated);
    return updated;
  }

  async updateDomainNameservers(domainId: string, nameservers: string[]): Promise<Domain | undefined> {
    return this.updateDomain(domainId, { nameservers });
  }

  async deleteDomain(id: string): Promise<boolean> {
    return this.domains.delete(id);
  }

  async bulkUpdateDomains(domainIds: string[], updates: Partial<Domain>): Promise<Domain[]> {
    const updatedDomains: Domain[] = [];
    
    for (const id of domainIds) {
      const updated = await this.updateDomain(id, updates);
      if (updated) {
        updatedDomains.push(updated);
      }
    }
    
    return updatedDomains;
  }

  async getDomainStats(userId: string): Promise<{
    totalDomains: number;
    expiringSoon: number;
    activeDomains: number;
    thisMonth: number;
  }> {
    const userDomains = Array.from(this.domains.values()).filter(
      (domain) => domain.userId === userId
    );

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      totalDomains: userDomains.length,
      expiringSoon: userDomains.filter(d => 
        d.expirationDate <= thirtyDaysFromNow && d.expirationDate > now
      ).length,
      activeDomains: userDomains.filter(d => d.status === 'active').length,
      thisMonth: userDomains.filter(d => 
        d.registrationDate >= startOfMonth && d.registrationDate <= endOfMonth
      ).length,
    };
  }
}

export const storage = new MemStorage();
