import { JOB_TITLES, EMPLOYMENT_STATUSES } from './constants';

/**
 * Represents a generated test employee with all required fields.
 */
export interface GeneratedEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
  jobTitle: string;
  employmentStatus: string;
  profilePicturePath: string;
}

/** First name pool for realistic test data */
const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Morgan',
  'Casey',
  'Taylor',
  'Riley',
  'Avery',
  'Quinn',
  'Blake',
  'Cameron',
] as const;

/** Last name pool for realistic test data */
const LAST_NAMES = [
  'Anderson',
  'Mitchell',
  'Parker',
  'Sullivan',
  'Reynolds',
  'Bennett',
  'Crawford',
  'Donovan',
  'Fletcher',
  'Harrison',
] as const;

/**
 * Generates a unique employee with randomized but realistic data.
 * Employee ID uses a timestamp + random suffix strategy to avoid collisions.
 *
 * @returns A fully populated employee object ready for test use
 */
export function generateUniqueEmployee(): GeneratedEmployee {
  const randomFirst =
    FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const randomLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  // Generate a unique suffix using timestamp seconds and random digits
  const now = new Date();
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const randomSuffix = Math.floor(Math.random() * 900 + 100); // 3-digit random

  // OrangeHRM Employee ID field accepts up to 10 characters
  // Format: AUT + HHmm + 3-digit random = 10 chars max
  const employeeId = `AUT${timePart}${randomSuffix}`;

  const jobTitle = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  const employmentStatus =
    EMPLOYMENT_STATUSES[Math.floor(Math.random() * EMPLOYMENT_STATUSES.length)];

  return {
    firstName: randomFirst,
    lastName: randomLast,
    employeeId,
    jobTitle,
    employmentStatus,
    profilePicturePath: 'assets/profile-picture.jpg',
  };
}

/**
 * Generates employee data from the JSON fixture file, applying unique ID.
 * Useful for data-driven testing with predefined base data.
 */
export function applyUniqueId(
  baseData: Partial<GeneratedEmployee>
): GeneratedEmployee {
  const defaults = generateUniqueEmployee();
  return {
    ...defaults,
    ...baseData,
    // Always override employeeId for uniqueness
    employeeId: defaults.employeeId,
  };
}
