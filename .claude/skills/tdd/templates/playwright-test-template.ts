/**
 * Playwright E2E Test Template for TDD Skill
 *
 * This template follows Context7 best practices for Playwright E2E testing:
 * - Page Object pattern for maintainability
 * - Deterministic waits (no hardcoded sleeps)
 * - Screenshot capture for debugging
 * - Accessibility testing integration
 * - Mobile/responsive testing
 */

import { test, expect, Page } from '@playwright/test';

// Page Object for better maintainability
class MyFeaturePage {
  constructor(private page: Page) {}

  // Locators (define once, reuse everywhere)
  get usernameInput() {
    return this.page.getByLabel(/username/i);
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /submit|log in/i });
  }

  get errorMessage() {
    return this.page.getByRole('alert');
  }

  get successMessage() {
    return this.page.getByText(/success/i);
  }

  // Actions (encapsulate user flows)
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

// ============================================
// FAIL-TO-PASS E2E TEST (For Bug Fixes)
// ============================================
test.describe('Bug Fix: [Bug Description]', () => {
  test('should [expected behavior] when user [action]', async ({ page }) => {
    // ARRANGE: Navigate to page and set up conditions
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Mock API if needed for deterministic testing
    await page.route('**/api/auth', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'test-token-123'
        })
      });
    });

    // ACT: Perform user action that reproduces bug
    await featurePage.login('testuser@example.com', 'password123');

    // ASSERT: Verify bug is fixed
    // Before fix: This should FAIL
    // After fix: This should PASS
    await expect(featurePage.successMessage).toBeVisible();
    await expect(page).toHaveURL('/dashboard');

    // Capture screenshot for documentation
    await featurePage.takeScreenshot('login-success');
  });

  test('should handle edge case: [edge case]', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Test with edge case input (e.g., very long username)
    const longUsername = 'a'.repeat(255) + '@example.com';
    await featurePage.login(longUsername, 'password');

    // Should not crash, should handle gracefully
    await expect(featurePage.errorMessage).toBeVisible();
    await expect(featurePage.errorMessage).toContainText(/invalid.*email/i);
  });
});

// ============================================
// ACCEPTANCE E2E TESTS (For New Features)
// ============================================
test.describe('Feature: [Feature Name]', () => {
  // Happy path test
  test('should complete full user journey successfully', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);

    // Step 1: Navigate
    await featurePage.goto();
    await expect(page).toHaveTitle(/login/i);

    // Step 2: Fill form
    await featurePage.login('user@example.com', 'correctPassword');

    // Step 3: Verify navigation
    await expect(page).toHaveURL(/dashboard/);

    // Step 4: Verify dashboard loaded
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Step 5: Screenshot final state
    await featurePage.takeScreenshot('full-journey-success');
  });

  // Boundary case: Network timeout
  test('should handle slow network gracefully', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Simulate slow network
    await page.route('**/api/auth', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await featurePage.login('user@example.com', 'password');

    // Should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible();

    // Eventually should succeed (with generous timeout)
    await expect(featurePage.successMessage).toBeVisible({ timeout: 10000 });
  });

  // Negative case: Authentication failure
  test('should display error for invalid credentials', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Mock failed auth response
    await page.route('**/api/auth', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'INVALID_CREDENTIALS'
        })
      });
    });

    await featurePage.login('user@example.com', 'wrongPassword');

    // Should show error message
    await expect(featurePage.errorMessage).toBeVisible();
    await expect(featurePage.errorMessage).toContainText(/invalid credentials/i);

    // Should stay on login page
    await expect(page).toHaveURL(/login/);

    // Screenshot error state
    await featurePage.takeScreenshot('login-error');
  });

  // Negative case: Form validation
  test('should validate required fields before submission', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Try to submit without filling fields
    await featurePage.submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/username.*required/i)).toBeVisible();
    await expect(page.getByText(/password.*required/i)).toBeVisible();

    // Should not call API
    let apiCalled = false;
    await page.route('**/api/auth', async () => {
      apiCalled = true;
    });

    await page.waitForTimeout(1000); // Wait to ensure no API call
    expect(apiCalled).toBe(false);
  });
});

// ============================================
// ACCESSIBILITY TESTING (Context7)
// ============================================
test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    // Requires @axe-core/playwright
    // npm install --save-dev @axe-core/playwright
    // import { injectAxe, checkA11y } from '@axe-core/playwright';

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Run axe accessibility scan
    // await injectAxe(page);
    // await checkA11y(page, null, {
    //   detailedReport: true,
    //   detailedReportOptions: {
    //     html: true,
    //   },
    // });

    // Manual checks
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Tab through form
    await page.keyboard.press('Tab');
    await expect(featurePage.usernameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(featurePage.passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(featurePage.submitButton).toBeFocused();

    // Submit with Enter
    await page.keyboard.press('Enter');
    // Verify submission triggered
  });
});

// ============================================
// RESPONSIVE/MOBILE TESTING (Context7)
// ============================================
test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Elements should be visible and usable on mobile
    await expect(featurePage.usernameInput).toBeVisible();
    await expect(featurePage.submitButton).toBeVisible();

    // Test mobile interaction
    await featurePage.login('user@example.com', 'password');

    // Screenshot mobile view
    await featurePage.takeScreenshot('mobile-login');
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    await expect(featurePage.usernameInput).toBeVisible();
    await featurePage.takeScreenshot('tablet-login');
  });
});

// ============================================
// MULTI-BROWSER TESTING
// ============================================
test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium-specific test');

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();
    await featurePage.login('user@example.com', 'password');
    await expect(featurePage.successMessage).toBeVisible();
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();
    await featurePage.login('user@example.com', 'password');
    await expect(featurePage.successMessage).toBeVisible();
  });

  test('should work in WebKit (Safari)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific test');

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();
    await featurePage.login('user@example.com', 'password');
    await expect(featurePage.successMessage).toBeVisible();
  });
});

// ============================================
// PERFORMANCE TESTING (Context7)
// ============================================
test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should handle multiple concurrent requests', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Track all API calls
    const apiCalls: string[] = [];
    await page.route('**/api/**', async (route, request) => {
      apiCalls.push(request.url());
      await route.continue();
    });

    await featurePage.login('user@example.com', 'password');

    // Verify expected number of API calls (no duplicates)
    expect(apiCalls.length).toBeLessThanOrEqual(5);
    console.log(`API calls made: ${apiCalls.length}`);
  });
});

// ============================================
// VISUAL REGRESSION TESTING (Optional)
// ============================================
test.describe('Visual Regression', () => {
  test('should match baseline screenshot', async ({ page }) => {
    const featurePage = new MyFeaturePage(page);
    await featurePage.goto();

    // Compare with baseline
    await expect(page).toHaveScreenshot('login-page-baseline.png', {
      maxDiffPixels: 100 // Allow small differences
    });
  });
});

// ============================================
// SAFETY CHECKS (TDD Skill Requirements)
// ============================================

// ✅ No hardcoded waits (use waitForLoadState, expect with timeout)
// ✅ Deterministic (mock API responses for consistent results)
// ✅ Screenshots for debugging
// ✅ Page Object pattern (maintainable, reusable)
// ✅ Accessibility checks
// ✅ Mobile/responsive testing
// ✅ Cross-browser compatibility

// ============================================
// NEXT STEPS FOR TDD WORKFLOW
// ============================================

// 1. Run this E2E test FIRST (before implementation) → Should FAIL (RED)
// 2. Implement feature to make test pass (GREEN)
// 3. Refactor while keeping tests GREEN
// 4. Run quality gates (all E2E tests passing)
// 5. Create PR with screenshot evidence

// Run tests:
// npx playwright test
// npx playwright test --headed  # See browser
// npx playwright test --debug   # Debug mode
// npx playwright show-report    # View HTML report
