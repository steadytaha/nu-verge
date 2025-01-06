import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// Types
type UserCredits = string | null;
interface User {
  clerkId: string;
  credits: UserCredits;
}

// Error classes
class InvalidUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserError';
  }
}

class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

// Helper functions
const getUserIdFromHeaders = (headersList: Headers): string | null => {
  let userId: string | null = null;
  headersList.forEach((value, key) => {
    if (key.toLowerCase() === "user-id") {
      userId = value;
    }
  });
  return userId;
};

const hasEnoughCredits = (credits: UserCredits): boolean => {
  if (credits === "Unlimited") return true;
  if (!credits) return false;
  const numCredits = parseInt(credits);
  return !isNaN(numCredits) && numCredits > 0;
};

const deductUserCredit = async (user: User): Promise<void> => {
  // Don't deduct if credits are "Unlimited"
  if (user.credits === "Unlimited") return;

  // Ensure credits is a valid number
  const currentCredits = parseInt(user.credits || "0");
  if (isNaN(currentCredits)) {
    throw new Error("Invalid credits value");
  }

  // Perform the update
  try {
    await db.user.update({
      where: {
        clerkId: user.clerkId,
      },
      data: {
        credits: String(currentCredits - 1)  // Convert back to string for storage
      },
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    throw new Error("Failed to update credits");
  }
};

export async function POST(req: NextRequest) {
  try {
    // Get user ID from headers
    const headersList = headers();
    const userId = getUserIdFromHeaders(await headersList);

    if (!userId) {
      throw new InvalidUserError("User ID not found in headers");
    }

    // Find user in database
    const user = await db.user.findFirst({
      where: {
        clerkId: userId,
      },
      select: {
        clerkId: true,
        credits: true,
      },
    });

    if (!user) {
      throw new InvalidUserError("User not found in database");
    }

    // Check credits
    if (!hasEnoughCredits(user.credits)) {
      throw new InsufficientCreditsError("User has insufficient credits");
    }

    // Deduct credit if not unlimited
    await deductUserCredit(user);

    // Return success response
    return Response.json(
      {
        message: "Flow completed successfully",
        status: "success",
        remainingCredits: user.credits === "Unlimited" ? "Unlimited" : String(parseInt(user.credits!) - 1)
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);

    if (error instanceof InvalidUserError) {
      return Response.json(
        {
          message: error.message,
          status: "error",
        },
        {
          status: 401,
        }
      );
    }

    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          message: error.message,
          status: "error",
        },
        {
          status: 403,
        }
      );
    }

    return Response.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}