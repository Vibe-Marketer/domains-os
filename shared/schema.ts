import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const registrarConnections = pgTable("registrar_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  registrar: text("registrar").notNull(), // 'godaddy', 'namecheap', 'dynadot'
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret"),
  isActive: boolean("is_active").notNull().default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  registrarConnectionId: varchar("registrar_connection_id").notNull().references(() => registrarConnections.id),
  name: text("name").notNull(),
  registrar: text("registrar").notNull(),
  status: text("status").notNull(), // 'active', 'expiring', 'expired', 'pending'
  expirationDate: timestamp("expiration_date").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
  nameservers: jsonb("nameservers").notNull().default([]),
  autoRenew: boolean("auto_renew").notNull().default(false),
  lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
  registrarDomainId: text("registrar_domain_id"), // External ID from registrar
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRegistrarConnectionSchema = createInsertSchema(registrarConnections).omit({
  id: true,
  lastSync: true,
  createdAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  lastUpdated: true,
});

export const updateNameserversSchema = z.object({
  domainId: z.string().min(1),
  nameservers: z.array(z.string().min(1)).min(1).max(10),
});

// Domain purchase schemas
export const domainPurchaseSchema = z.object({
  domainName: z.string().min(1),
  registrar: z.enum(['godaddy', 'namecheap', 'dynadot']),
  years: z.number().min(1).max(10).default(1),
  autoRenew: z.boolean().default(false),
  nameservers: z.array(z.string()).optional(),
  contacts: z.object({
    registrant: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      organization: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(2).max(2), // ISO country code
    }),
    administrative: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      organization: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(2).max(2),
    }).optional(),
    technical: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      organization: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(2).max(2),
    }).optional(),
    billing: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      organization: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(2).max(2),
    }).optional(),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRegistrarConnection = z.infer<typeof insertRegistrarConnectionSchema>;
export type RegistrarConnection = typeof registrarConnections.$inferSelect;

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

export type UpdateNameservers = z.infer<typeof updateNameserversSchema>;
export type DomainPurchase = z.infer<typeof domainPurchaseSchema>;

export type DomainWithConnection = Domain & {
  registrarConnection: RegistrarConnection;
};
