import {
  generateUniqueEmployee,
  type GeneratedEmployee,
} from '../utils/dataGenerator';
import employeeFixtures from './employeeData.json';
import { Logger } from '../utils/logger';

/**
 * Test data provider interface for fixture data.
 */
export interface EmployeeFixture {
  firstName: string;
  lastName: string;
  jobTitle: string;
  employmentStatus: string;
  profilePicture: string;
}

/**
 * Load base employee data from the JSON fixture.
 */
export function getEmployeeFixtures(): EmployeeFixture[] {
  return employeeFixtures.employees;
}

/**
 * Generate a unique employee for testing.
 * Combines fixture data with dynamically generated unique identifiers.
 *
 * @param index - Optional index to select a specific fixture template (0-2)
 * @returns A fully unique employee ready for test execution
 */
export function createTestEmployee(index = 0): GeneratedEmployee {
  const fixtures = getEmployeeFixtures();
  const template = fixtures[index % fixtures.length];
  const generated = generateUniqueEmployee();

  const employee: GeneratedEmployee = {
    firstName: template.firstName || generated.firstName,
    lastName: template.lastName || generated.lastName,
    employeeId: generated.employeeId, // Always unique
    jobTitle: template.jobTitle || generated.jobTitle,
    employmentStatus: template.employmentStatus || generated.employmentStatus,
    profilePicturePath: template.profilePicture || generated.profilePicturePath,
  };

  Logger.info('Generated test employee', {
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    jobTitle: employee.jobTitle,
    employmentStatus: employee.employmentStatus,
  });

  return employee;
}
