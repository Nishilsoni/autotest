/**
 * Application URL paths for OrangeHRM.
 */
export const ROUTES = {
  LOGIN: '/web/index.php/auth/login',
  DASHBOARD: '/web/index.php/dashboard/index',
  PIM_EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
  PIM_ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',
} as const;

/**
 * Timeouts for various operations (in milliseconds).
 */
export const TIMEOUTS = {
  /** Default navigation timeout */
  NAVIGATION: 30_000,
  /** Default action timeout */
  ACTION: 15_000,
  /** Toast notification visibility timeout */
  TOAST: 10_000,
  /** Page load after login */
  PAGE_LOAD: 20_000,
  /** Dropdown option appearance */
  DROPDOWN: 10_000,
} as const;

/**
 * Available job titles in the OrangeHRM demo application.
 * These are pre-configured values that exist in the system.
 */
export const JOB_TITLES = [
  'Software Engineer',
  'QA Lead',
  'HR Manager',
  'Chief Executive Officer',
  'Account Assistant',
  'Chief Financial Officer',
  'IT Manager',
  'VP - Client Services',
  'Sales Representative',
] as const;

/**
 * Available employment statuses in the OrangeHRM demo application.
 */
export const EMPLOYMENT_STATUSES = [
  'Full-Time Permanent',
  'Full-Time Contract',
  'Part-Time Contract',
  'Part-Time Internship',
  'Freelance',
] as const;

/**
 * Test assertion messages for consistent, descriptive test output.
 */
export const MESSAGES = {
  LOGIN_PAGE_LOADED:
    'Login page should be fully loaded with all form elements visible',
  LOGIN_SUCCESS: 'Dashboard should be visible after successful login',
  DASHBOARD_VISIBLE: 'Dashboard page heading should be displayed',
  PIM_NAVIGATION: 'PIM module should be accessible from the sidebar',
  EMPLOYEE_CREATED: 'New employee should be successfully created and visible',
  EMPLOYEE_SEARCH_FOUND: 'Employee should be found in search results',
  EMPLOYEE_UPDATED: 'Employee details should be updated successfully',
  EMPLOYEE_DELETED: 'Employee should be successfully deleted',
  EMPLOYEE_NOT_FOUND: 'Deleted employee should not appear in search results',
  LOGOUT_SUCCESS: 'User should be redirected to login page after logout',
  SESSION_INVALIDATED:
    'Protected pages should redirect unauthenticated users to login',
  API_CREATE_SUCCESS: 'API should return successful creation response',
  API_GET_SUCCESS: 'API should return employee data successfully',
  API_UPDATE_SUCCESS: 'API should return successful update response',
  API_DELETE_SUCCESS: 'API should return successful deletion response',
} as const;
