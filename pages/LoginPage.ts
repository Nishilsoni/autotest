import { Page, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS, MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';

/**
 * Page Object for the OrangeHRM Login Page.
 * Encapsulates all login-related selectors and actions.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get usernameInput() {
    return this.page.getByPlaceholder('Username');
  }

  private get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }

  private get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  private get invalidCredentialsAlert() {
    return this.page.getByRole('alert');
  }

  // ─── Actions ────────────────────────────────────────────────

  /** Navigate to the login page */
  async navigate(): Promise<void> {
    Logger.step('Navigating to login page');
    await this.page.goto(ROUTES.LOGIN, {
      waitUntil: 'domcontentloaded',
    });
    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.PAGE_LOAD,
    });
  }

  /** Enter username into the login form */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Enter password into the login form */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Click the Login button */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Complete login workflow: enter credentials and submit.
   * Does NOT log the password value.
   */
  async login(username: string, password: string): Promise<void> {
    Logger.step('Performing login');
    Logger.info('Logging in', { username, passwordProvided: '***' });
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  // ─── Assertions ─────────────────────────────────────────────

  /** Verify that the login page is fully loaded and interactive */
  async expectLoginPageLoaded(): Promise<void> {
    await expect(
      this.usernameInput,
      'Username field should be visible on login page'
    ).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });

    await expect(
      this.passwordInput,
      'Password field should be visible on login page'
    ).toBeVisible();

    await expect(
      this.loginButton,
      'Login button should be visible on login page'
    ).toBeVisible();

    Logger.success('Login page loaded successfully');
  }

  /** Verify that login succeeded by checking URL change */
  async expectLoginSuccessful(): Promise<void> {
    await this.page.waitForURL('**/dashboard/**', {
      timeout: TIMEOUTS.PAGE_LOAD,
    });
    Logger.success(MESSAGES.LOGIN_SUCCESS);
  }

  /** Verify that an error message is displayed after failed login */
  async expectLoginError(): Promise<void> {
    await expect(
      this.invalidCredentialsAlert,
      'Invalid credentials alert should be displayed'
    ).toBeVisible({ timeout: TIMEOUTS.TOAST });
  }

  /** Check if we're on the login page (for session invalidation checks) */
  async expectOnLoginPage(): Promise<void> {
    await expect(this.usernameInput, MESSAGES.SESSION_INVALIDATED).toBeVisible({
      timeout: TIMEOUTS.PAGE_LOAD,
    });

    Logger.success('Confirmed: user is on the login page');
  }
}
