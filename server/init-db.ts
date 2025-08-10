import { storage } from "./storage";

export async function initializeDatabase() {
  // Create demo user
  try {
    const existingUser = await storage.getUserByUsername("demo");
    if (!existingUser) {
      await storage.createUser({
        username: "demo",
        password: "demo123"
      });
      console.log("Created demo user");
    }

    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      throw new Error("Failed to create or find demo user");
    }

    // Create real API connections using environment variables
    const existingConnections = await storage.getRegistrarConnections(demoUser.id);
    
    if (existingConnections.length === 0) {
      console.log("Setting up real API connections...");
      
      // GoDaddy connection
      if (process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET) {
        await storage.createRegistrarConnection({
          userId: demoUser.id,
          registrar: "godaddy",
          apiKey: process.env.GODADDY_API_KEY,
          apiSecret: process.env.GODADDY_API_SECRET,
          isActive: true,
        });
        console.log("✓ Created GoDaddy connection");
      }

      // Namecheap connection  
      if (process.env.NAMECHEAP_API_KEY && process.env.NAMECHEAP_USERNAME) {
        await storage.createRegistrarConnection({
          userId: demoUser.id,
          registrar: "namecheap", 
          apiKey: process.env.NAMECHEAP_API_KEY,
          apiSecret: process.env.NAMECHEAP_USERNAME,
          isActive: true,
        });
        console.log("✓ Created Namecheap connection");
      }

      // Dynadot connection
      if (process.env.DYNADOT_API_TOKEN) {
        await storage.createRegistrarConnection({
          userId: demoUser.id,
          registrar: "dynadot",
          apiKey: process.env.DYNADOT_API_TOKEN,
          apiSecret: null,
          isActive: true,
        });
        console.log("✓ Created Dynadot connection");
      }
    }

    return demoUser.id;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}