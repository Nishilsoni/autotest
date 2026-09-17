/**
 * Lightweight structured logger for test automation.
 * Provides consistent, readable log output without exposing sensitive data.
 */
export class Logger {
  private static readonly PREFIX = '[AutoTest]';

  /** Log a general informational message */
  static info(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    console.log(`${timestamp} ${Logger.PREFIX} ℹ️  ${message}${dataStr}`);
  }

  /** Log a test step */
  static step(stepName: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${Logger.PREFIX} 🔹 STEP: ${stepName}`);
  }

  /** Log a successful operation */
  static success(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${Logger.PREFIX} ✅ ${message}`);
  }

  /** Log a warning */
  static warn(message: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`${timestamp} ${Logger.PREFIX} ⚠️  ${message}`);
  }

  /** Log an error */
  static error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    const errorStr = error instanceof Error ? ` | ${error.message}` : '';
    console.error(`${timestamp} ${Logger.PREFIX} ❌ ${message}${errorStr}`);
  }

  /** Log API interaction (without sensitive data) */
  static api(method: string, endpoint: string, status?: number): void {
    const timestamp = new Date().toISOString();
    const statusStr = status !== undefined ? ` → ${status}` : '';
    console.log(
      `${timestamp} ${Logger.PREFIX} 🌐 API: ${method} ${endpoint}${statusStr}`
    );
  }
}
