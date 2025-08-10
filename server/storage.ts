import { type User, type InsertUser, type Domain, type InsertDomain, type RegistrarConnection, type InsertRegistrarConnection, type DomainWithConnection, type UpdateNameservers, users, registrarConnections, domains } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, like, desc } from "drizzle-orm";

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
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "mock-user-123",
      username: "demo",
      password: "demo123"
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create demo registrar connections
    const connections = [
      {
        id: "godaddy-conn-1",
        userId: "mock-user-123",
        registrar: "godaddy",
        apiKey: process.env.GODADDY_API_KEY || "demo-godaddy-key",
        apiSecret: process.env.GODADDY_API_SECRET || "demo-godaddy-secret",
        isActive: true,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(),
      },
      {
        id: "namecheap-conn-1", 
        userId: "mock-user-123",
        registrar: "namecheap",
        apiKey: process.env.NAMECHEAP_API_KEY || "demo-namecheap-key",
        apiSecret: process.env.NAMECHEAP_USERNAME || "demo-user",
        isActive: true,
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(),
      },
      {
        id: "dynadot-conn-1",
        userId: "mock-user-123", 
        registrar: "dynadot",
        apiKey: process.env.DYNADOT_API_TOKEN || "demo-dynadot-key",
        apiSecret: null,
        isActive: true,
        lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(),
      }
    ];
    
    connections.forEach(conn => {
      this.registrarConnections.set(conn.id, conn);
    });
    
    // Create demo domains
    const demoDomains = [
      {
        id: "domain-1",
        userId: "mock-user-123",
        registrarConnectionId: "godaddy-conn-1",
        name: "example.com",
        registrar: "godaddy",
        status: "active",
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        registrationDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
        nameservers: ["ns1.godaddy.com", "ns2.godaddy.com"],
        autoRenew: true,
        lastUpdated: new Date(),
        registrarDomainId: "12345"
      },
      {
        id: "domain-2", 
        userId: "mock-user-123",
        registrarConnectionId: "namecheap-conn-1",
        name: "testdomain.net",
        registrar: "namecheap",
        status: "expiring",
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        registrationDate: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000), // Almost 1 year ago
        nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
        autoRenew: false,
        lastUpdated: new Date(),
        registrarDomainId: "nc-67890"
      },
      {
        id: "domain-3",
        userId: "mock-user-123", 
        registrarConnectionId: "dynadot-conn-1",
        name: "mysite.org",
        registrar: "dynadot",
        status: "active",
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        registrationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        nameservers: ["ns1.dynadot.com", "ns2.dynadot.com"],
        autoRenew: true,
        lastUpdated: new Date(),
        registrarDomainId: "dyn-abc123"
      },
      {
        id: "domain-4",
        userId: "mock-user-123",
        registrarConnectionId: "godaddy-conn-1", 
        name: "coldemaildomain.io",
        registrar: "godaddy",
        status: "active",
        expirationDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 10 months from now
        registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
        autoRenew: false,
        lastUpdated: new Date(),
        registrarDomainId: "gd-456789"
      },
      {
        id: "domain-5",
        userId: "mock-user-123",
        registrarConnectionId: "namecheap-conn-1",
        name: "newsletter-sender.com",
        registrar: "namecheap", 
        status: "active",
        expirationDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000), // 8 months from now
        registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        nameservers: ["ns1.digitalocean.com", "ns2.digitalocean.com"],
        autoRenew: true,
        lastUpdated: new Date(),
        registrarDomainId: "nc-111222"
      }
    ];
    
    demoDomains.forEach(domain => {
      this.domains.set(domain.id, domain);
    });
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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Registrar connection methods
  async getRegistrarConnections(userId: string): Promise<RegistrarConnection[]> {
    return await db.select().from(registrarConnections)
      .where(eq(registrarConnections.userId, userId))
      .orderBy(desc(registrarConnections.createdAt));
  }

  async createRegistrarConnection(connectionData: InsertRegistrarConnection): Promise<RegistrarConnection> {
    const [connection] = await db.insert(registrarConnections).values({
      ...connectionData,
      id: randomUUID(),
      createdAt: new Date(),
    }).returning();
    return connection;
  }

  async updateRegistrarConnection(id: string, updates: Partial<RegistrarConnection>): Promise<RegistrarConnection | undefined> {
    const [updated] = await db.update(registrarConnections)
      .set(updates)
      .where(eq(registrarConnections.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRegistrarConnection(id: string): Promise<boolean> {
    const result = await db.delete(registrarConnections)
      .where(eq(registrarConnections.id, id));
    return result.rowCount > 0;
  }

  // Domain methods
  async getDomains(userId: string, filters?: { registrar?: string; status?: string; search?: string }): Promise<DomainWithConnection[]> {
    let query = db.select({
      id: domains.id,
      userId: domains.userId,
      registrarConnectionId: domains.registrarConnectionId,
      name: domains.name,
      registrar: domains.registrar,
      status: domains.status,
      expirationDate: domains.expirationDate,
      registrationDate: domains.registrationDate,
      nameservers: domains.nameservers,
      autoRenew: domains.autoRenew,
      lastUpdated: domains.lastUpdated,
      registrarDomainId: domains.registrarDomainId,
      registrarConnection: {
        id: registrarConnections.id,
        userId: registrarConnections.userId,
        registrar: registrarConnections.registrar,
        apiKey: registrarConnections.apiKey,
        apiSecret: registrarConnections.apiSecret,
        isActive: registrarConnections.isActive,
        lastSync: registrarConnections.lastSync,
        createdAt: registrarConnections.createdAt,
      }
    }).from(domains)
      .leftJoin(registrarConnections, eq(domains.registrarConnectionId, registrarConnections.id))
      .where(eq(domains.userId, userId));

    if (filters?.registrar) {
      query = query.where(and(eq(domains.userId, userId), eq(domains.registrar, filters.registrar)));
    }
    if (filters?.status) {
      query = query.where(and(eq(domains.userId, userId), eq(domains.status, filters.status)));
    }
    if (filters?.search) {
      query = query.where(and(eq(domains.userId, userId), like(domains.name, `%${filters.search}%`)));
    }

    const results = await query.orderBy(desc(domains.lastUpdated));
    
    return results.map(result => ({
      ...result,
      registrarConnection: result.registrarConnection!
    }));
  }

  async getDomain(id: string): Promise<DomainWithConnection | undefined> {
    const [result] = await db.select({
      id: domains.id,
      userId: domains.userId,
      registrarConnectionId: domains.registrarConnectionId,
      name: domains.name,
      registrar: domains.registrar,
      status: domains.status,
      expirationDate: domains.expirationDate,
      registrationDate: domains.registrationDate,
      nameservers: domains.nameservers,
      autoRenew: domains.autoRenew,
      lastUpdated: domains.lastUpdated,
      registrarDomainId: domains.registrarDomainId,
      registrarConnection: {
        id: registrarConnections.id,
        userId: registrarConnections.userId,
        registrar: registrarConnections.registrar,
        apiKey: registrarConnections.apiKey,
        apiSecret: registrarConnections.apiSecret,
        isActive: registrarConnections.isActive,
        lastSync: registrarConnections.lastSync,
        createdAt: registrarConnections.createdAt,
      }
    }).from(domains)
      .leftJoin(registrarConnections, eq(domains.registrarConnectionId, registrarConnections.id))
      .where(eq(domains.id, id));

    if (!result) return undefined;

    return {
      ...result,
      registrarConnection: result.registrarConnection!
    };
  }

  async createDomain(domainData: InsertDomain): Promise<Domain> {
    const [domain] = await db.insert(domains).values({
      ...domainData,
      id: randomUUID(),
      lastUpdated: new Date(),
    }).returning();
    return domain;
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined> {
    const [updated] = await db.update(domains)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(domains.id, id))
      .returning();
    return updated || undefined;
  }

  async updateDomainNameservers(domainId: string, nameservers: string[]): Promise<Domain | undefined> {
    const [updated] = await db.update(domains)
      .set({ 
        nameservers: nameservers,
        lastUpdated: new Date() 
      })
      .where(eq(domains.id, domainId))
      .returning();
    return updated || undefined;
  }

  async deleteDomain(id: string): Promise<boolean> {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return result.rowCount > 0;
  }

  async bulkUpdateDomains(domainIds: string[], updates: Partial<Domain>): Promise<Domain[]> {
    // For PostgreSQL, we'd need to use a more complex query or loop
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
    const userDomains = await db.select().from(domains).where(eq(domains.userId, userId));

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

export const storage = new DatabaseStorage();
