import { Page, expect } from '@playwright/test';
import { TIMEOUTS, MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';

/**
 * Page Object for the OrangeHRM Employee Personal/Job Details page.
 * Handles editing employee job information after creation.
 */
export class EmployeeDetailsPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  /** Job tab link in the employee details page */
  private get jobTab() {
    return this.page.getByRole('link', { name: 'Job' });
  }

  /**
   * Job Title dropdown — scoped to the Job Title input group.
   * OrangeHRM uses custom dropdown components (oxd-select).
   */
  private get jobTitleDropdown() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: 'Job Title' }) })
      .locator('.oxd-select-text');
  }

  /**
   * Employment Status dropdown — scoped to the Employment Status input group.
   */
  private get employmentStatusDropdown() {
    return this.page
      .locator('.oxd-input-group')
      .filter({
        has: this.page.locator('label', { hasText: 'Employment Status' }),
      })
      .locator('.oxd-select-text');
  }

  /** Save button on the Job Details form */
  private get saveButton() {
    return this.page
      .locator('form')
      .filter({
        has: this.page.locator('.oxd-input-group').filter({
          has: this.page.locator('label', { hasText: 'Job Title' }),
        }),
      })
      .getByRole('button', { name: 'Save' });
  }

  private get successToast() {
    return this.page
      .locator('.oxd-toast--success, .oxd-toast')
      .filter({ hasText: /successfully/i });
  }

  // ─── Actions ────────────────────────────────────────────────

  /** Navigate to the Job tab of the employee details */
  async navigateToJobTab(): Promise<void> {
    Logger.step('Navigating to Job tab');
    await this.jobTab.click();
    await this.page.waitForURL('**/viewJobDetails/**', {
      timeout: TIMEOUTS.NAVIGATION,
    });
    // Wait for the job form to load
    await this.jobTitleDropdown.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.PAGE_LOAD,
    });
    Logger.success('Job tab loaded');
  }

  /**
   * Select a value from a custom OrangeHRM dropdown.
   * These are Vue-based custom select components, not native <select>.
   */
  private async selectDropdownOption(
    dropdownLocator: ReturnType<Page['locator']>,
    optionText: string
  ): Promise<void> {
    await dropdownLocator.click();

    // Wait for dropdown options to appear
    const optionLocator = this.page
      .locator('.oxd-select-dropdown [role="option"], .oxd-select-option')
      .filter({ hasText: optionText })
      .first();

    await optionLocator.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.DROPDOWN,
    });

    await optionLocator.click();
  }

  /** Update the Job Title to a specified value */
  async updateJobTitle(jobTitle: string): Promise<void> {
    Logger.step(`Updating job title to: ${jobTitle}`);
    await this.selectDropdownOption(this.jobTitleDropdown, jobTitle);
  }

  /** Update the Employment Status to a specified value */
  async updateEmploymentStatus(status: string): Promise<void> {
    Logger.step(`Updating employment status to: ${status}`);
    await this.selectDropdownOption(this.employmentStatusDropdown, status);
  }

  /** Save the changes on the Job tab */
  async saveChanges(): Promise<void> {
    Logger.step('Saving job detail changes');
    await this.saveButton.click();
  }

  // ─── Assertions ─────────────────────────────────────────────

  /** Verify the Job Title dropdown shows the expected value */
  async expectJobTitle(expectedTitle: string): Promise<void> {
    // Reload the page to confirm persistence
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.jobTitleDropdown.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.PAGE_LOAD,
    });

    await expect(
      this.jobTitleDropdown,
      `Job Title should display "${expectedTitle}" after save`
    ).toContainText(expectedTitle, { timeout: TIMEOUTS.ACTION });

    Logger.success(`Job title verified: ${expectedTitle}`);
  }

  /** Verify the Employment Status dropdown shows the expected value */
  async expectEmploymentStatus(expectedStatus: string): Promise<void> {
    await expect(
      this.employmentStatusDropdown,
      `Employment Status should display "${expectedStatus}" after save`
    ).toContainText(expectedStatus, { timeout: TIMEOUTS.ACTION });

    Logger.success(`Employment status verified: ${expectedStatus}`);
  }

  /** Verify update success toast notification */
  async expectUpdateSuccess(): Promise<void> {
    await expect(this.successToast, MESSAGES.EMPLOYEE_UPDATED).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });
  }
}
