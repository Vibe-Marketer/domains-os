import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createRegistrarAPI } from "./services/registrar";
import { insertRegistrarConnectionSchema, updateNameserversSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for development
  const MOCK_USER_ID = "mock-user-123";

  // Get domain statistics
  app.get("/api/domains/stats", async (req, res) => {
    try {
      const stats = await storage.getDomainStats(MOCK_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching domain stats:", error);
      res.status(500).json({ message: "Failed to fetch domain statistics" });
    }
  });

  // Get all domains with optional filters
  app.get("/api/domains", async (req, res) => {
    try {
      const { registrar, status, search } = req.query;
      const filters = {
        registrar: registrar as string,
        status: status as string,
        search: search as string,
      };

      const domains = await storage.getDomains(MOCK_USER_ID, filters);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  // Get specific domain
  app.get("/api/domains/:id", async (req, res) => {
    try {
      const domain = await storage.getDomain(req.params.id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      console.error("Error fetching domain:", error);
      res.status(500).json({ message: "Failed to fetch domain" });
    }
  });

  // Update domain nameservers
  app.patch("/api/domains/:id/nameservers", async (req, res) => {
    try {
      const { nameservers } = updateNameserversSchema.parse({
        domainId: req.params.id,
        nameservers: req.body.nameservers,
      });

      const domain = await storage.getDomain(req.params.id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      // Update nameservers via registrar API
      try {
        const registrarAPI = createRegistrarAPI(domain.registrarConnection);
        const success = await registrarAPI.updateNameservers(domain.name, nameservers);
        
        if (!success) {
          return res.status(400).json({ message: "Failed to update nameservers with registrar" });
        }
      } catch (apiError) {
        console.error("Registrar API error:", apiError);
        return res.status(400).json({ message: "Failed to communicate with registrar API" });
      }

      // Update in local storage
      const updatedDomain = await storage.updateDomainNameservers(req.params.id, nameservers);
      if (!updatedDomain) {
        return res.status(500).json({ message: "Failed to update domain in database" });
      }

      res.json(updatedDomain);
    } catch (error) {
      console.error("Error updating nameservers:", error);
      res.status(500).json({ message: "Failed to update nameservers" });
    }
  });

  // Bulk update domains
  app.patch("/api/domains/bulk", async (req, res) => {
    try {
      const { domainIds, updates } = req.body;
      
      if (!Array.isArray(domainIds) || domainIds.length === 0) {
        return res.status(400).json({ message: "domainIds must be a non-empty array" });
      }

      const updatedDomains = await storage.bulkUpdateDomains(domainIds, updates);
      res.json(updatedDomains);
    } catch (error) {
      console.error("Error bulk updating domains:", error);
      res.status(500).json({ message: "Failed to bulk update domains" });
    }
  });

  // Get registrar connections
  app.get("/api/registrars", async (req, res) => {
    try {
      const connections = await storage.getRegistrarConnections(MOCK_USER_ID);
      // Don't send API keys/secrets to frontend
      const sanitizedConnections = connections.map(conn => ({
        ...conn,
        apiKey: undefined,
        apiSecret: undefined,
      }));
      res.json(sanitizedConnections);
    } catch (error) {
      console.error("Error fetching registrar connections:", error);
      res.status(500).json({ message: "Failed to fetch registrar connections" });
    }
  });

  // Create registrar connection
  app.post("/api/registrars", async (req, res) => {
    try {
      const connectionData = insertRegistrarConnectionSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID,
      });

      // Test the connection before saving
      try {
        const testAPI = createRegistrarAPI({
          ...connectionData,
          id: 'test',
          apiSecret: connectionData.apiSecret || null,
          isActive: connectionData.isActive ?? true,
          lastSync: null,
          createdAt: new Date(),
        });
        
        const isValid = await testAPI.testConnection();
        if (!isValid) {
          return res.status(400).json({ message: "Invalid API credentials" });
        }
      } catch (apiError) {
        console.error("API test error:", apiError);
        return res.status(400).json({ message: "Failed to connect to registrar API" });
      }

      const connection = await storage.createRegistrarConnection(connectionData);
      
      // Don't send API keys/secrets to frontend
      const sanitizedConnection = {
        ...connection,
        apiKey: undefined,
        apiSecret: undefined,
      };
      
      res.json(sanitizedConnection);
    } catch (error) {
      console.error("Error creating registrar connection:", error);
      res.status(500).json({ message: "Failed to create registrar connection" });
    }
  });

  // Sync domains from registrar
  app.post("/api/registrars/:id/sync", async (req, res) => {
    try {
      const connectionId = req.params.id;
      const connections = await storage.getRegistrarConnections(MOCK_USER_ID);
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Registrar connection not found" });
      }

      try {
        const registrarAPI = createRegistrarAPI(connection);
        const remoteDomains = await registrarAPI.getDomains();
        
        const syncedDomains = [];
        for (const remoteDomain of remoteDomains) {
          // Check if domain already exists
          const existingDomains = await storage.getDomains(MOCK_USER_ID, { search: remoteDomain.name });
          const existingDomain = existingDomains.find(d => d.name === remoteDomain.name);
          
          if (existingDomain) {
            // Update existing domain
            const updated = await storage.updateDomain(existingDomain.id, {
              status: remoteDomain.status,
              expirationDate: remoteDomain.expirationDate,
              nameservers: remoteDomain.nameservers,
              registrarDomainId: remoteDomain.registrarDomainId,
            });
            if (updated) syncedDomains.push(updated);
          } else {
            // Create new domain
            const newDomain = await storage.createDomain({
              userId: MOCK_USER_ID,
              registrarConnectionId: connectionId,
              name: remoteDomain.name,
              registrar: connection.registrar,
              status: remoteDomain.status,
              expirationDate: remoteDomain.expirationDate,
              registrationDate: remoteDomain.registrationDate,
              nameservers: remoteDomain.nameservers,
              autoRenew: false,
              registrarDomainId: remoteDomain.registrarDomainId,
            });
            syncedDomains.push(newDomain);
          }
        }

        // Update last sync time
        await storage.updateRegistrarConnection(connectionId, {
          lastSync: new Date(),
        });

        res.json({ 
          message: "Sync completed successfully",
          syncedCount: syncedDomains.length 
        });
      } catch (apiError) {
        console.error("Registrar sync error:", apiError);
        res.status(400).json({ message: "Failed to sync with registrar API" });
      }
    } catch (error) {
      console.error("Error syncing domains:", error);
      res.status(500).json({ message: "Failed to sync domains" });
    }
  });

  // Delete registrar connection
  app.delete("/api/registrars/:id", async (req, res) => {
    try {
      const success = await storage.deleteRegistrarConnection(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Registrar connection not found" });
      }
      res.json({ message: "Registrar connection deleted successfully" });
    } catch (error) {
      console.error("Error deleting registrar connection:", error);
      res.status(500).json({ message: "Failed to delete registrar connection" });
    }
  });

  // Domain search endpoint using registrar APIs
  app.get("/api/domains/search/:domainName", async (req, res) => {
    try {
      const { domainName } = req.params;
      const { registrar, showPrice = false, currency = 'USD' } = req.query;

      // Get registrar connections
      const connections = await storage.getRegistrarConnections(MOCK_USER_ID);
      
      if (registrar) {
        // Search with specific registrar
        const connection = connections.find(c => c.registrar === registrar && c.isActive);
        if (!connection) {
          return res.status(404).json({ message: `No active ${registrar} connection found` });
        }

        const api = createRegistrarAPI(connection);
        
        // Use registrar-specific search if available
        if (connection.registrar === 'dynadot' && 'searchDomain' in api) {
          const result = await (api as any).searchDomain(domainName, showPrice === 'true', currency as string);
          return res.json({ registrar: registrar, result });
        } else if (connection.registrar === 'godaddy' && 'checkDomainAvailability' in api) {
          const result = await (api as any).checkDomainAvailability(domainName);
          return res.json({ registrar: registrar, result });
        } else if (connection.registrar === 'namecheap' && 'checkDomainAvailability' in api) {
          const result = await (api as any).checkDomainAvailability(domainName);
          return res.json({ registrar: registrar, result });
        }
        
        // Fallback for registrars without search implementation
        return res.json({ 
          registrar: registrar, 
          result: { 
            domain_name: domainName, 
            available: 'unknown',
            message: 'Search not implemented for this registrar'
          }
        });
      }

      // Search across all active registrars
      const results = [];
      for (const connection of connections.filter(c => c.isActive)) {
        try {
          const api = createRegistrarAPI(connection);
          
          if (connection.registrar === 'dynadot' && 'searchDomain' in api) {
            const result = await (api as any).searchDomain(domainName, showPrice === 'true', currency as string);
            results.push({ registrar: connection.registrar, result });
          } else if (connection.registrar === 'godaddy' && 'checkDomainAvailability' in api) {
            const result = await (api as any).checkDomainAvailability(domainName);
            // Normalize GoDaddy response format to match others
            const normalizedResult = {
              domain_name: domainName,
              available: result.available ? 'yes' : 'no',
              premium: result.price && result.price > 0 ? 'yes' : 'no',
              price_list: result.price ? [{
                currency: result.currency || 'USD',
                registration: result.price.toString(),
                transfer: result.price.toString(),
                restore: (result.price * 1.5).toString()
              }] : undefined
            };
            results.push({ registrar: connection.registrar, result: normalizedResult });
          } else if (connection.registrar === 'namecheap' && 'checkDomainAvailability' in api) {
            const result = await (api as any).checkDomainAvailability(domainName);
            // Normalize Namecheap response format to match others
            const normalizedResult = {
              domain_name: domainName,
              available: result.available ? 'yes' : 'no',
              premium: result.premiumName ? 'yes' : 'no'
            };
            results.push({ registrar: connection.registrar, result: normalizedResult });
          } else {
            results.push({ 
              registrar: connection.registrar, 
              result: { 
                domain_name: domainName, 
                available: 'unknown',
                message: 'Search not implemented for this registrar'
              }
            });
          }
        } catch (error) {
          console.error(`Search failed for ${connection.registrar}:`, error);
          results.push({ 
            registrar: connection.registrar, 
            result: { 
              domain_name: domainName, 
              available: 'error',
              message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error("Domain search error:", error);
      res.status(500).json({ message: "Failed to search domain" });
    }
  });

  // Bulk domain search endpoint
  app.post("/api/domains/bulk-search", async (req, res) => {
    try {
      const { domainNames, registrar } = req.body;
      
      if (!domainNames || !Array.isArray(domainNames)) {
        return res.status(400).json({ message: "domainNames must be an array" });
      }

      const connections = await storage.getRegistrarConnections(MOCK_USER_ID);
      const results = [];

      if (registrar) {
        // Bulk search with specific registrar
        const connection = connections.find(c => c.registrar === registrar && c.isActive);
        if (!connection) {
          return res.status(404).json({ message: `No active ${registrar} connection found` });
        }

        const api = createRegistrarAPI(connection);
        
        if (connection.registrar === 'dynadot' && 'bulkSearchDomains' in api) {
          const result = await (api as any).bulkSearchDomains(domainNames);
          return res.json({ registrar: registrar, result });
        } else if (connection.registrar === 'godaddy' && 'bulkCheckAvailability' in api) {
          const result = await (api as any).bulkCheckAvailability(domainNames);
          return res.json({ registrar: registrar, result });
        } else {
          // Sequential search for registrars without bulk search
          const result = [];
          for (const domain of domainNames) {
            try {
              if (connection.registrar === 'namecheap' && 'checkDomainAvailability' in api) {
                const domainResult = await (api as any).checkDomainAvailability(domain);
                result.push({
                  domain: domain,
                  available: domainResult.available,
                  premiumName: domainResult.premiumName
                });
              } else {
                result.push({ domain: domain, available: false });
              }
            } catch (error) {
              result.push({ domain: domain, available: false, error: error instanceof Error ? error.message : 'Unknown error' });
            }
          }
          return res.json({ registrar: registrar, result });
        }
      }

      // Bulk search across all registrars
      for (const connection of connections.filter(c => c.isActive)) {
        try {
          const api = createRegistrarAPI(connection);
          
          if (connection.registrar === 'dynadot' && 'bulkSearchDomains' in api) {
            const result = await (api as any).bulkSearchDomains(domainNames);
            results.push({ registrar: connection.registrar, result });
          } else {
            results.push({ 
              registrar: connection.registrar, 
              result: domainNames.map(name => ({ domain_name: name, available: 'unknown' }))
            });
          }
        } catch (error) {
          console.error(`Bulk search failed for ${connection.registrar}:`, error);
          results.push({ 
            registrar: connection.registrar, 
            result: domainNames.map(name => ({ domain_name: name, available: 'error' }))
          });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error("Bulk domain search error:", error);
      res.status(500).json({ message: "Failed to perform bulk search" });
    }
  });

  // API status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const connections = await storage.getRegistrarConnections(MOCK_USER_ID);
      const status = [];

      for (const connection of connections) {
        let apiStatus = 'unknown';
        let lastError = null;
        let features = [];

        try {
          const api = createRegistrarAPI(connection);
          const isWorking = await api.testConnection();
          
          if (isWorking) {
            apiStatus = 'connected';
            // Check available features
            if ('searchDomain' in api) features.push('domain_search');
            if ('bulkSearchDomains' in api) features.push('bulk_search');
            if ('checkDomainAvailability' in api) features.push('availability_check');
            if ('getDomains' in api) features.push('domain_listing');
            if ('updateNameservers' in api) features.push('nameserver_management');
          } else {
            apiStatus = 'connection_failed';
          }
        } catch (error) {
          apiStatus = 'error';
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }

        status.push({
          registrar: connection.registrar,
          status: apiStatus,
          features,
          lastError,
          usingRealCredentials: !connection.apiKey.startsWith('demo-'),
          environment: connection.registrar === 'godaddy' ? 'OTE (Testing)' : 
                      connection.registrar === 'namecheap' ? 'Sandbox' : 'Production'
        });
      }

      res.json({ 
        status,
        summary: {
          total: connections.length,
          connected: status.filter(s => s.status === 'connected').length,
          errors: status.filter(s => s.status === 'error').length
        }
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ message: "Failed to check API status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
