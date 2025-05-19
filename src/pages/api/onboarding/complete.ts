import { NextApiRequest, NextApiResponse } from "next";
import { Client, Databases, Query } from "appwrite";
import { getSession } from "next-auth/react";
import { logger } from "../../../utils/logger";

// Define interfaces for type safety
interface OnboardingData {
  genres?: string[];
  artists?: string[];
  ratings?: any[];
  following?: string[];
  rymImported?: boolean;
  lastCompletedStep?: string;
  completed?: boolean;
  completedAt?: string;
}

interface UserPreferences {
  onboarding: OnboardingData;
  [key: string]: any;
}

// Initialize Appwrite
const client = new Client()
  .setEndpoint(
    process.env.VITE_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1"
  )
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || "681f8b930020ae807d29");

const databases = new Databases(client);

// Database and collection IDs
const DB_ID = "default_database";
const USERS_COLLECTION = "users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.email || session.user.name;
    const onboardingData = req.body;

    if (!onboardingData) {
      return res.status(400).json({ message: "Missing onboarding data" });
    }

    logger.info("Completing onboarding process", {
      category: "onboarding",
      data: { userId },
    });

    // Fetch current user data
    const response = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("$id", userId),
      Query.limit(1),
    ]);

    let userData;
    let documentId;
    let preferences: UserPreferences = { onboarding: {} };

    if (response.documents.length === 0) {
      // User document doesn't exist yet, create it
      logger.info("Creating new user document for onboarding completion", {
        category: "onboarding",
        data: { userId },
      });

      // Create a new user document
      userData = await databases.createDocument(
        DB_ID,
        USERS_COLLECTION,
        userId, // Use the user's ID as the document ID
        {
          username: session.user.name || "user_" + userId.substring(0, 8),
          preferences: "{}",
        }
      );
      documentId = userData.$id;
    } else {
      userData = response.documents[0];
      documentId = userData.$id;
      preferences = userData.preferences
        ? typeof userData.preferences === "string"
          ? JSON.parse(userData.preferences)
          : userData.preferences
        : { onboarding: {} };
    }

    // Update the onboarding data
    if (!preferences.onboarding || typeof preferences.onboarding !== "object") {
      preferences.onboarding = {};
    }

    // Save all onboarding data
    preferences.onboarding = {
      ...preferences.onboarding,
      genres: onboardingData.genres || [],
      artists: onboardingData.artists || [],
      ratings: onboardingData.ratings || [],
      following: onboardingData.following || [],
      rymImported: onboardingData.rymImported || false,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Update the user document with the new preferences
    await databases.updateDocument(DB_ID, USERS_COLLECTION, documentId, {
      preferences: JSON.stringify(preferences),
    });

    // Save user genres to genres collection if they don't exist
    if (onboardingData.genres && onboardingData.genres.length > 0) {
      try {
        for (const genreName of onboardingData.genres) {
          // Check if genre exists
          const genreResponse = await databases.listDocuments(DB_ID, "genres", [
            Query.equal("name", genreName),
            Query.limit(1),
          ]);

          // If genre doesn't exist, create it
          if (genreResponse.documents.length === 0) {
            await databases.createDocument(DB_ID, "genres", "unique()", {
              name: genreName,
            });
          }
        }
      } catch (error) {
        logger.error("Error saving genres during onboarding completion", {
          category: "onboarding",
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        // Continue execution even if genre saving fails
      }
    }

    logger.info("Onboarding completed successfully", {
      category: "onboarding",
      data: { userId },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error completing onboarding", {
      category: "onboarding",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
    return res.status(500).json({ message: "Failed to complete onboarding" });
  }
}
