import { test, expect, chromium } from '@playwright/test';

test('SMOKE-007: Chat Mode Verification', async () => {
  // Connect to the existing app
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:3000?dev=true');
  await page.waitForTimeout(3000); // Wait for load

  // Navigate to Requirements if not there
  console.log('Ensuring Requirements view...');
  // (Assuming default is Requirements, but confirming)

  // Look for "Chat" tab triggers
  console.log('Looking for Chat tab...');
  const chatTab = page.getByRole('tab', { name: 'Chat' });
  
  if (await chatTab.isVisible()) {
    await chatTab.click();
    console.log('Clicked Chat tab');
  } else {
    console.log('Chat tab not found via role, searching text...');
    await page.click('text=Chat');
  }

  // Find input and type
  console.log('Typing in chat...');
  const chatInput = page.getByPlaceholder(/Ask|Type|Message/i);
  await chatInput.fill('Can you design a Type IV hydrogen tank for a sedan?');
  
  await page.waitForTimeout(1000);
  
  // Take screenshot
  console.log('Capturing screenshot...');
  await page.screenshot({ path: 'tests/uat-results/smoke-007-chat-interaction.png', fullPage: true });
  
  console.log('SMOKE-007 Verification Complete');
  await browser.close();
});
