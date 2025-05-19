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
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.email || session.user.name;
    logger.info("Fetching onboarding progress from Appwrite", {
      category: "onboarding",
      data: { userId },
    });

    // Fetch user data from Appwrite
    const response = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("$id", userId),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) {
      logger.info("No user document found, returning empty onboarding data", {
        category: "onboarding",
        data: { userId },
      });
      return res.status(200).json({
        genres: [],
        artists: [],
        ratings: [],
        following: [],
        rymImported: false,
        lastCompletedStep: undefined,
      });
    }

    const userData = response.documents[0];
    const preferences = userData.preferences
      ? JSON.parse(userData.preferences)
      : {};
    const onboardingData =
      preferences.onboarding && typeof preferences.onboarding === "object"
        ? preferences.onboarding
        : {};

    logger.info("Onboarding progress fetched successfully", {
      category: "onboarding",
      data: { userId, hasData: !!onboardingData },
    });

    return res.status(200).json({
      genres: onboardingData.genres || [],
      artists: onboardingData.artists || [],
      ratings: onboardingData.ratings || [],
      following: onboardingData.following || [],
      rymImported: onboardingData.rymImported || false,
      lastCompletedStep: onboardingData.lastCompletedStep,
    });
  } catch (error) {
    logger.error("Error fetching onboarding progress", {
      category: "onboarding",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
    return res
      .status(500)
      .json({ message: "Failed to fetch onboarding progress" });
  }
}
