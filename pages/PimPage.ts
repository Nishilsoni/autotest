import { Page, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS, MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';

/**
 * Page Object for the OrangeHRM PIM (Employee List) page.
 * Handles employee search, selection, deletion, and navigation to add employee.
 */
export class PimPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get addEmployeeButton() {
    return this.page.getByRole('link', { name: 'Add Employee' });
  }

  /** The Employee Id search input field */
  private get employeeIdSearchInput() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: 'Employee Id' }) })
      .locator('input.oxd-input');
  }

  private get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }

  private get recordsTable() {
    return this.page.locator('.oxd-table');
  }

  private get tableRows() {
    return this.page.locator('.oxd-table-body .oxd-table-row');
  }

  private get noRecordsMessage() {
    return this.page.getByText('No Records Found').first();
  }

  private get deleteConfirmButton() {
    return this.page.getByRole('button', { name: /Yes, Delete/i });
  }

  private get successToast() {
    return this.page
      .locator('.oxd-toast')
      .filter({ hasText: /successfully/i })
      .first();
  }

  // ─── Actions ────────────────────────────────────────────────

  /** Navigate directly to PIM Employee List page */
  async navigateToPIM(): Promise<void> {
    Logger.step('Navigating to PIM Employee List');
    await this.page.goto(ROUTES.PIM_EMPLOYEE_LIST, {
      waitUntil: 'domcontentloaded',
    });
    await this.recordsTable.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.PAGE_LOAD,
    });
  }

  /** Click the Add Employee sub-menu / tab */
  async clickAddEmployee(): Promise<void> {
    Logger.step('Clicking Add Employee');
    await this.addEmployeeButton.click();
    await this.page.waitForURL('**/addEmployee**', {
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  /** Search for an employee by their Employee ID */
  async searchEmployeeById(employeeId: string): Promise<void> {
    Logger.step(`Searching for employee ID: ${employeeId}`);
    if (!this.page.url().includes('/pim/viewEmployeeList')) {
      await this.navigateToPIM();
    }

    // Wait for the search form to be ready
    await this.employeeIdSearchInput.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.ACTION,
    });

    await this.employeeIdSearchInput.fill(employeeId);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/v2/pim/employees') &&
          response
            .url()
            .includes(`employeeId=${encodeURIComponent(employeeId)}`) &&
          response.status() === 200,
        { timeout: TIMEOUTS.ACTION }
      ),
      this.searchButton.click(),
    ]);

    // Allow the table DOM to update
    await this.page.waitForTimeout(500);
  }

  /** Open the first employee from search results by clicking the row */
  async openEmployee(): Promise<void> {
    Logger.step('Opening employee record');
    // Click the edit (pencil) icon on the first result row
    const editButton = this.tableRows
      .first()
      .locator('.oxd-icon.bi-pencil-fill')
      .first();
    await editButton.click();
    await this.page.waitForURL('**/viewPersonalDetails/**', {
      timeout: TIMEOUTS.NAVIGATION,
    });
    Logger.success('Employee record opened');
  }

  /** Select the first employee checkbox in search results */
  async selectEmployee(): Promise<void> {
    const checkbox = this.tableRows
      .first()
      .locator('.oxd-checkbox-input')
      .first();
    await checkbox.click();
  }

  /** Delete the employee via the trash icon on their specific table row */
  async deleteEmployee(employeeId?: string): Promise<void> {
    Logger.step('Deleting employee');

    const targetRow = employeeId
      ? this.tableRows.filter({ hasText: employeeId }).first()
      : this.tableRows.first();

    await targetRow.waitFor({ state: 'visible', timeout: TIMEOUTS.ACTION });

    // Click the trash icon on the target row
    const deleteButton = targetRow.locator('.oxd-icon.bi-trash').first();
    await deleteButton.click();
  }

  /** Confirm the deletion in the confirmation dialog */
  async confirmDelete(): Promise<void> {
    Logger.step('Confirming employee deletion');

    // Wait for the deletion API to complete while confirming
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/v2/pim/employees') &&
          response.request().method() === 'DELETE' &&
          (response.status() === 200 || response.status() === 204),
        { timeout: TIMEOUTS.ACTION }
      ),
      this.deleteConfirmButton.click(),
    ]);

    Logger.success(MESSAGES.EMPLOYEE_DELETED);
  }

  // ─── Assertions ─────────────────────────────────────────────

  /** Verify that the employee appears in search results */
  async expectEmployeeInResults(employeeId: string): Promise<void> {
    await expect(
      this.tableRows.first(),
      MESSAGES.EMPLOYEE_SEARCH_FOUND
    ).toBeVisible({ timeout: TIMEOUTS.ACTION });

    // Verify the employee ID appears in the results table
    await expect(
      this.recordsTable.getByText(employeeId),
      `Employee ID ${employeeId} should appear in search results`
    ).toBeVisible({ timeout: TIMEOUTS.ACTION });

    Logger.success(`Employee ${employeeId} found in search results`);
  }

  /** Verify that no employee records are found after deletion */
  async expectEmployeeNotInResults(): Promise<void> {
    await expect(
      this.noRecordsMessage,
      MESSAGES.EMPLOYEE_NOT_FOUND
    ).toBeVisible({ timeout: TIMEOUTS.ACTION });

    Logger.success('Confirmed: employee no longer appears in search results');
  }

  /** Verify deletion success toast */
  async expectDeletionSuccess(): Promise<void> {
    await expect(
      this.successToast,
      'Deletion success notification should be displayed'
    ).toBeVisible({ timeout: TIMEOUTS.TOAST });
  }
}
