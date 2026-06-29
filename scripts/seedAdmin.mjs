import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dns from 'node:dns';

// Force Node to use Google/Cloudflare DNS to bypass local ISP SRV blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Parse env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    process.env[key] = value;
  }
});

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    
    const db = client.db(); // Uses the DB from the URI
    const usersCollection = db.collection('users');

    const existingAdmin = await usersCollection.findOne({ email: 'admin@gigverse.com' });
    
    if (existingAdmin) {
      console.log("Admin user already exists.");
    } else {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const newAdmin = {
        name: 'System Admin',
        email: 'admin@gigverse.com',
        password: hashedPassword,
        role: 'admin',
        permissions: { canApproveTransactions: true },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newAdmin);
      console.log(`Admin user created with ID: ${result.insertedId}`);
    }

  } catch (error) {
    console.error("Failed to seed admin:", error);
  } finally {
    await client.close();
  }
}

seedAdmin();
