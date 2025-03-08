import { Polar } from "@polar-sh/sdk";

// Get Polar API key from environment variables
const POLAR_API_KEY = process.env.NEXT_POLAR_ACCESS_TOKEN;

// Validate API key
if (!POLAR_API_KEY) {
  console.warn("Polar API key is not set. Subscription verification will not work properly.");
}

// Initialize Polar client
export const polarClient = new Polar({
  accessToken: POLAR_API_KEY || "",
});

/**
 * Check if a subscription is active using the Polar SDK
 * @param subscriptionId - The Polar subscription ID to verify
 * @returns Promise<boolean> - True if subscription is active, false otherwise
 */
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
    const subscription = await polarClient.subscriptions.retrieve(subscriptionId);
    
    // Check if subscription status is active
    return subscription && subscription.status === "active";
  } catch (error) {
    console.error("Error verifying Polar subscription:", error);
    return false;
  }
}

/**
 * Get customer details from Polar
 * @param customerId - The Polar customer ID
 * @returns Promise with customer details or null if not found
 */
export async function getCustomerDetails(customerId: string) {
  try {
    if (!POLAR_API_KEY || !customerId) {
      return null;
    }

    // Fetch customer details from Polar API
    return await polarClient.customers.retrieve(customerId);
  } catch (error) {
    console.error("Error fetching Polar customer details:", error);
    return null;
  }
}

/**
 * List all subscriptions for a customer
 * @param customerId - The Polar customer ID
 * @returns Promise with subscriptions array or empty array if none/error
 */
export async function listCustomerSubscriptions(customerId: string) {
  try {
    if (!POLAR_API_KEY || !customerId) {
      return [];
    }

    // List all subscriptions for the customer
    const response = await polarClient.subscriptions.list({
      customerId: customerId
    });
    
    return response.items || [];
  } catch (error) {
    console.error("Error listing customer subscriptions:", error);
    return [];
  }
} 