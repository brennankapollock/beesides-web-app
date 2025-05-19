import { Client, Account, Databases, Storage } from 'appwrite';

// Get environment variables
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// Verify environment variables are loaded
if (!appwriteEndpoint) {
  throw new Error("Missing VITE_APPWRITE_ENDPOINT environment variable. Please set it in your .env file.");
}
if (!appwriteProjectId) {
  throw new Error("Missing VITE_APPWRITE_PROJECT_ID environment variable. Please set it in your .env file.");
}

// Create Appwrite client
const client = new Client();

// Configure the client
client
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Create service instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export utilities from Appwrite
export { ID, Query } from 'appwrite'; // Export ID and Query for convenience elsewhere
