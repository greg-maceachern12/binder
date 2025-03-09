import { Polar } from "@polar-sh/sdk";

// Get Polar API key from environment variables
const POLAR_API_KEY = process.env.NEXT_POLAR_ACCESS_TOKEN;

// Validate API key
if (!POLAR_API_KEY) {
  console.warn("Polar API key is not set. Subscription verification will not work properly.");
}

// Initialize Polar client with access token
export const polar = new Polar({
  accessToken: POLAR_API_KEY || "",
});

export async function verifySubscription(subscriptionId: string): Promise<boolean> {
  try {
    if (!POLAR_API_KEY) {
      console.warn("Polar API key is missing - subscription verification disabled");
      return false;
    }

    if (!subscriptionId) {
      return false;
    }

    // Fetch subscription details from Polar API
    const subscription = await polar.subscriptions.get({
      id:subscriptionId,
    });
    console.log('subscription');
    console.log(subscription);
    // Check if subscription status is active
    return subscription && subscription.status === "active";
  } catch (error) {
    console.error("Error verifying Polar subscription:", error);
    return false;
  }
}