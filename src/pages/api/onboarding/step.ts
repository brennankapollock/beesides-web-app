import { NextApiRequest, NextApiResponse } from "next";
import { Client, Databases, Query } from "appwrite";
import { getSession } from "next-auth/react";
import { logger } from "../../../utils/logger";

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
    const { step, data, lastCompletedStep } = req.body;

    if (!step || data === undefined) {
      return res
        .status(400)
        .json({ message: "Missing required fields: step and data" });
    }

    logger.info(`Updating onboarding step: ${step}`, {
      category: "onboarding",
      data: { userId, step },
    });

    // Fetch current user data
    const response = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("$id", userId),
      Query.limit(1),
    ]);

    let userData;
    let documentId;
    let preferences = {};

    if (response.documents.length === 0) {
      // User document doesn't exist yet, create it
      logger.info("Creating new user document for onboarding", {
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
        ? JSON.parse(userData.preferences)
        : {};
    }

    // Update the onboarding data for this step
    if (!preferences.onboarding || typeof preferences.onboarding !== "object") {
      preferences.onboarding = {};
    }

    // Update the specific step data
    preferences.onboarding[step] = data;

    // Update the last completed step if provided
    if (lastCompletedStep) {
      preferences.onboarding.lastCompletedStep = lastCompletedStep;
    }

    // Update the user document with the new preferences
    await databases.updateDocument(DB_ID, USERS_COLLECTION, documentId, {
      preferences: JSON.stringify(preferences),
    });

    logger.info(`Onboarding step ${step} updated successfully`, {
      category: "onboarding",
      data: { userId, step },
    });

    return res.status(200).json({ success: true, step });
  } catch (error) {
    logger.error("Error updating onboarding step", {
      category: "onboarding",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
    return res
      .status(500)
      .json({ message: "Failed to update onboarding step" });
  }
}
