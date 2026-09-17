import { Page, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS, MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';

/**
 * Page Object for the OrangeHRM Dashboard.
 * Handles dashboard verification, sidebar navigation, and logout.
 */
export class DashboardPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get dashboardHeading() {
    return this.page.getByRole('heading', { name: 'Dashboard' });
  }

  private get pimMenuItem() {
    return this.page.getByRole('link', { name: 'PIM' });
  }

  private get userDropdown() {
    return this.page.locator('.oxd-userdropdown');
  }

  private get logoutLink() {
    return this.page.getByRole('menuitem', { name: 'Logout' });
  }

  // ─── Actions ────────────────────────────────────────────────

  /** Navigate to PIM module via sidebar */
  async openPIM(): Promise<void> {
    Logger.step('Navigating to PIM module');
    await this.pimMenuItem.click();
    await this.page.waitForURL('**/pim/**', {
      timeout: TIMEOUTS.NAVIGATION,
    });
    Logger.success('PIM module opened');
  }

  /** Perform logout via user dropdown menu */
  async logout(): Promise<void> {
    Logger.step('Performing logout');
    await this.userDropdown.click();
    await this.logoutLink.click();
    await this.page.waitForURL('**/auth/login**', {
      timeout: TIMEOUTS.NAVIGATION,
    });
    Logger.success('Logged out successfully');
  }

  // ─── Assertions ─────────────────────────────────────────────

  /** Verify the dashboard page is visible after login */
  async expectDashboardVisible(): Promise<void> {
    await expect(this.dashboardHeading, MESSAGES.DASHBOARD_VISIBLE).toBeVisible(
      { timeout: TIMEOUTS.PAGE_LOAD }
    );

    // Verify URL confirms we're on the dashboard
    await expect(this.page).toHaveURL(/.*dashboard.*/, {
      timeout: TIMEOUTS.PAGE_LOAD,
    });

    Logger.success('Dashboard is visible and verified');
  }

  /** Verify the dashboard is NOT accessible (for session invalidation) */
  async expectDashboardNotAccessible(): Promise<void> {
    await this.page.goto(ROUTES.DASHBOARD, {
      waitUntil: 'domcontentloaded',
    });

    // The app should redirect unauthenticated users to login
    await this.page.waitForURL('**/auth/login**', {
      timeout: TIMEOUTS.NAVIGATION,
    });

    Logger.success(MESSAGES.SESSION_INVALIDATED);
  }
}
