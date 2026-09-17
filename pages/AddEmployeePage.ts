import { Page, expect } from '@playwright/test';
import { TIMEOUTS, MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';
import path from 'path';

/**
 * Page Object for the OrangeHRM Add Employee page.
 * Handles employee creation form including profile picture upload.
 */
export class AddEmployeePage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get firstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }

  private get lastNameInput() {
    return this.page.getByPlaceholder('Last Name');
  }

  /** Employee ID input — the text input in the employee id group */
  private get employeeIdInput() {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: 'Employee Id' }) })
      .locator('input.oxd-input');
  }

  private get profilePictureInput() {
    return this.page.locator('input[type="file"]');
  }

  private get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  // ─── Actions ────────────────────────────────────────────────

  /** Enter the first name */
  async enterFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  /** Enter the last name */
  async enterLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  /** Clear and enter the employee ID */
  async enterEmployeeId(employeeId: string): Promise<void> {
    Logger.info('Setting employee ID', { employeeId });
    await this.employeeIdInput.clear();
    await this.employeeIdInput.fill(employeeId);
  }

  /**
   * Upload a profile picture.
   * Resolves the file path relative to the repository root.
   */
  async uploadProfilePicture(relativePath: string): Promise<void> {
    Logger.step('Uploading profile picture');
    const absolutePath = path.resolve(process.cwd(), relativePath);
    await this.profilePictureInput.setInputFiles(absolutePath);
    Logger.success('Profile picture uploaded');
  }

  /** Click the Save button to create the employee */
  async saveEmployee(): Promise<void> {
    Logger.step('Saving new employee');
    await this.saveButton.click();
  }

  // ─── Assertions ─────────────────────────────────────────────

  /** Verify the Add Employee form is loaded and ready */
  async expectFormReady(): Promise<void> {
    await expect(
      this.firstNameInput,
      'First Name field should be visible on Add Employee form'
    ).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });

    await expect(
      this.lastNameInput,
      'Last Name field should be visible on Add Employee form'
    ).toBeVisible();
  }

  /**
   * Verify employee creation was successful.
   * Checks for redirect to Personal Details and employee name visibility.
   */
  async expectEmployeeCreated(
    firstName: string,
    lastName: string
  ): Promise<void> {
    // After successful save, OrangeHRM redirects to the Personal Details page
    await this.page.waitForURL('**/viewPersonalDetails/**', {
      timeout: TIMEOUTS.PAGE_LOAD,
    });

    // Verify the employee name is displayed on the personal details page
    const employeeNameHeading = this.page.getByRole('heading', {
      name: `${firstName} ${lastName}`,
    });

    await expect(employeeNameHeading, MESSAGES.EMPLOYEE_CREATED).toBeVisible({
      timeout: TIMEOUTS.PAGE_LOAD,
    });

    Logger.success(`Employee created: ${firstName} ${lastName}`);
  }
}
