/**
 * Centralized environment variable configuration for Mandi API integration.
 * All AGMARKNET-related configuration is sourced from environment variables here.
 */
export const AGMARKNET_CONFIG = {
  /**
   * Base URL for the AGMARKNET API.
   * Replace this in your .env file once you have AGMARKNET API access.
   * Example: AGMARKNET_API_URL=https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24
   */
  apiUrl: process.env.AGMARKNET_API_URL || "",

  /**
   * API key for AGMARKNET / data.gov.in API.
   * Obtain from https://data.gov.in/
   */
  apiKey: process.env.AGMARKNET_API_KEY || "",

  /**
   * Request timeout in milliseconds.
   */
  timeoutMs: parseInt(process.env.AGMARKNET_TIMEOUT_MS || "8000", 10),

  /**
   * Set to "true" to force use of mock data (useful for development without API access).
   */
  useMock: process.env.AGMARKNET_USE_MOCK === "true" || !process.env.AGMARKNET_API_KEY,
};
