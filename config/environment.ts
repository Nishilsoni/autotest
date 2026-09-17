import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Centralized environment configuration.
 * All environment-dependent values are read here and validated.
 */
export const ENV = {
  /** Base URL for OrangeHRM application */
  BASE_URL:
    process.env.ORANGEHRM_BASE_URL ||
    'https://opensource-demo.orangehrmlive.com',

  /** Login credentials - must be set via environment variables */
  USERNAME: process.env.ORANGEHRM_USERNAME || 'Admin',
  PASSWORD: process.env.ORANGEHRM_PASSWORD || 'admin123',

  /** API base URL for simulated API validation (ReqRes) */
  API_BASE_URL: process.env.API_BASE_URL || 'https://reqres.in/api',

  /** ReqRes API key (raises the anonymous 40 req/day limit) */
  REQRES_API_KEY: process.env.REQRES_API_KEY || '',

  /** OrangeHRM internal API base path */
  ORANGEHRM_API_PATH: '/web/index.php/api/v2',
} as const;

/**
 * Validates that critical environment variables are available.
 * Called during test setup to fail fast on misconfiguration.
 */
export function validateEnvironment(): void {
  if (!ENV.BASE_URL) {
    throw new Error('ORANGEHRM_BASE_URL environment variable is required');
  }
  if (!ENV.USERNAME) {
    throw new Error('ORANGEHRM_USERNAME environment variable is required');
  }
  if (!ENV.PASSWORD) {
    throw new Error('ORANGEHRM_PASSWORD environment variable is required');
  }
}
