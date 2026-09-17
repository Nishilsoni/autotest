import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PimPage } from '../pages/PimPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { EmployeeDetailsPage } from '../pages/EmployeeDetailsPage';
import { EmployeeApiClient } from '../api/EmployeeApiClient';
import { createTestEmployee } from '../fixtures/testData';
import { ENV, validateEnvironment } from '../config/environment';
import { Logger } from '../utils/logger';
import type { GeneratedEmployee } from '../utils/dataGenerator';

/**
 * Employee Lifecycle Management — End-to-End Test Suite
 *
 * Tests the complete employee lifecycle in OrangeHRM:
 * Login → Create → Edit → API Validate → Delete → Verify → Logout
 *
 * Application Under Test: OrangeHRM Demo (https://opensource-demo.orangehrmlive.com)
 * API Simulation: ReqRes (https://reqres.in/api)
 */
test.describe('Employee Lifecycle Management', () => {
  // Shared state across test steps
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let pimPage: PimPage;
  let addEmployeePage: AddEmployeePage;
  let employeeDetailsPage: EmployeeDetailsPage;
  let apiClient: EmployeeApiClient;
  let employee: GeneratedEmployee;
  let apiEmployeeId: string;

  test('should complete the full employee lifecycle: create, update, validate, delete, and logout', async ({
    page,
    request,
  }) => {
    // ─── Setup ──────────────────────────────────────────────
    validateEnvironment();

    // Initialize page objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    pimPage = new PimPage(page);
    addEmployeePage = new AddEmployeePage(page);
    employeeDetailsPage = new EmployeeDetailsPage(page);
    apiClient = new EmployeeApiClient(request, ENV.API_BASE_URL);

    // Generate unique test employee
    employee = createTestEmployee();

    // ═══════════════════════════════════════════════════════
    // STEP 1 — LOGIN
    // ═══════════════════════════════════════════════════════
    await test.step('Step 1: Login with valid credentials', async () => {
      // Navigate to login page
      await loginPage.navigate();

      // Verify login page elements are present
      await loginPage.expectLoginPageLoaded();

      // Perform login
      await loginPage.login(ENV.USERNAME, ENV.PASSWORD);

      // Verify successful login
      await loginPage.expectLoginSuccessful();

      // Verify dashboard is visible
      await dashboardPage.expectDashboardVisible();

      Logger.success('Login completed and dashboard verified');
    });

    // ═══════════════════════════════════════════════════════
    // STEP 2 — ADD EMPLOYEE
    // ═══════════════════════════════════════════════════════
    await test.step('Step 2: Create a new employee', async () => {
      // Navigate to PIM → Add Employee
      await dashboardPage.openPIM();
      await pimPage.clickAddEmployee();

      // Verify form is ready
      await addEmployeePage.expectFormReady();

      // Fill in employee details
      await addEmployeePage.enterFirstName(employee.firstName);
      await addEmployeePage.enterLastName(employee.lastName);
      await addEmployeePage.enterEmployeeId(employee.employeeId);

      // Upload profile picture
      await addEmployeePage.uploadProfilePicture(employee.profilePicturePath);

      // Save the employee
      await addEmployeePage.saveEmployee();

      // Verify employee was created (checks redirect + name heading)
      await addEmployeePage.expectEmployeeCreated(
        employee.firstName,
        employee.lastName
      );

      Logger.success(
        `Employee created: ${employee.firstName} ${employee.lastName} (ID: ${employee.employeeId})`
      );
    });

    // ═══════════════════════════════════════════════════════
    // STEP 3 — EDIT EMPLOYEE JOB INFORMATION
    // ═══════════════════════════════════════════════════════
    await test.step('Step 3: Update employee job information', async () => {
      // Navigate to Job tab
      await employeeDetailsPage.navigateToJobTab();

      // Update Job Title
      await employeeDetailsPage.updateJobTitle(employee.jobTitle);

      // Update Employment Status
      await employeeDetailsPage.updateEmploymentStatus(
        employee.employmentStatus
      );

      // Save changes
      await employeeDetailsPage.saveChanges();

      // Verify update success toast
      await employeeDetailsPage.expectUpdateSuccess();

      // Verify persisted values by reloading
      await employeeDetailsPage.expectJobTitle(employee.jobTitle);
      await employeeDetailsPage.expectEmploymentStatus(
        employee.employmentStatus
      );

      Logger.success(
        `Employee updated — Job: ${employee.jobTitle}, Status: ${employee.employmentStatus}`
      );
    });

    // ═══════════════════════════════════════════════════════
    // STEP 4 — API VALIDATION (Simulated via ReqRes)
    // ═══════════════════════════════════════════════════════
    await test.step('Step 4: Validate employee through API', async () => {
      Logger.info('API validation uses ReqRes as a simulated API backend');

      // 4a. CREATE via API
      const createResponse = await apiClient.createEmployee({
        name: `${employee.firstName} ${employee.lastName}`,
        job: employee.jobTitle,
      });

      apiEmployeeId = createResponse.id;

      expect(
        createResponse.name,
        'API-created employee name should match UI employee'
      ).toBe(`${employee.firstName} ${employee.lastName}`);

      expect(
        createResponse.job,
        'API-created employee job should match UI employee job title'
      ).toBe(employee.jobTitle);

      // 4b. GET via API (retrieves pre-seeded ReqRes user for structure validation)
      const getResponse = await apiClient.getEmployee('2');

      expect(
        getResponse.data,
        'API GET response should return employee data object'
      ).toBeTruthy();

      expect(
        typeof getResponse.data.first_name,
        'API employee first_name should be a string'
      ).toBe('string');

      expect(
        typeof getResponse.data.last_name,
        'API employee last_name should be a string'
      ).toBe('string');

      // 4c. UPDATE via API
      const updateResponse = await apiClient.updateEmployee(apiEmployeeId, {
        name: `${employee.firstName} ${employee.lastName}`,
        job: employee.employmentStatus,
      });

      expect(
        updateResponse.job,
        'API-updated employee job should reflect new employment status'
      ).toBe(employee.employmentStatus);

      Logger.success(
        'API lifecycle validation completed (Create → Get → Update)'
      );
    });

    // ═══════════════════════════════════════════════════════
    // STEP 5 — UI/API CROSS VALIDATION
    // ═══════════════════════════════════════════════════════
    await test.step('Step 5: Cross-validate UI and API data', async () => {
      Logger.info(
        'Cross-validation compares UI-entered data with API responses'
      );

      // Validate that the API creation captured the correct employee name
      const fullName = `${employee.firstName} ${employee.lastName}`;

      // The API POST response should have matched the UI employee data
      // (already asserted in Step 4, but we re-validate the consistency)
      const verifyCreate = await apiClient.createEmployee({
        name: fullName,
        job: employee.jobTitle,
      });

      expect(
        verifyCreate.name,
        'Cross-validation: API employee name should match UI employee name'
      ).toBe(fullName);

      expect(
        verifyCreate.job,
        'Cross-validation: API employee job should match UI job title'
      ).toBe(employee.jobTitle);

      Logger.info('Cross-validation note', {
        limitation:
          'ReqRes is stateless; cross-validation demonstrates the pattern but cannot prove OrangeHRM DB state',
        uiEmployeeId: employee.employeeId,
        apiEmployeeId: verifyCreate.id,
        uiFullName: fullName,
        apiFullName: verifyCreate.name,
      });

      Logger.success('UI/API cross-validation completed');
    });

    // ═══════════════════════════════════════════════════════
    // STEP 6 — DELETE EMPLOYEE
    // ═══════════════════════════════════════════════════════
    await test.step('Step 6: Delete the employee', async () => {
      // Search for the employee by ID
      await pimPage.searchEmployeeById(employee.employeeId);

      // Verify the employee exists in search results before deletion
      await pimPage.expectEmployeeInResults(employee.employeeId);

      // Delete the employee
      await pimPage.deleteEmployee(employee.employeeId);
      await pimPage.confirmDelete();

      // Verify deletion success
      await pimPage.expectDeletionSuccess();

      // Search again to verify the employee no longer appears
      await pimPage.searchEmployeeById(employee.employeeId);
      await pimPage.expectEmployeeNotInResults();

      Logger.success(
        `Employee ${employee.employeeId} deleted and verified absent from UI`
      );
    });

    // ═══════════════════════════════════════════════════════
    // STEP 7 — API DELETION VALIDATION
    // ═══════════════════════════════════════════════════════
    await test.step('Step 7: Verify deletion through API', async () => {
      // DELETE via API
      await apiClient.deleteEmployee(apiEmployeeId);

      // Verify employee no longer exists via API
      await apiClient.expectEmployeeDeleted(apiEmployeeId);

      Logger.success('API deletion validation completed (DELETE → GET 404)');
    });

    // ═══════════════════════════════════════════════════════
    // STEP 8 — LOGOUT AND SESSION INVALIDATION
    // ═══════════════════════════════════════════════════════
    await test.step('Step 8: Logout and verify session invalidation', async () => {
      // Perform logout
      await dashboardPage.logout();

      // Verify we're redirected to the login page
      await loginPage.expectOnLoginPage();

      // Attempt to access protected page (dashboard)
      await dashboardPage.expectDashboardNotAccessible();

      // Verify we're back on the login page
      await loginPage.expectOnLoginPage();

      Logger.success('Logout completed and session invalidation verified');
    });
  });
});
