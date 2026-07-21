const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message));

  // Log in directly via localStorage using a freshly issued admin JWT (bypasses OTP flow for this smoke test)
  await page.goto('http://localhost:5173/');
  const jwt = require('jsonwebtoken');
  require('dotenv').config({ path: 'D:/DXC technology internship/SLA-Monitoring-App/backend/.env' });
  const token = jwt.sign({ id: 5, email: 'yasminesouikiii@gmail.com', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  await page.evaluate(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, [token, { id: 5, email: 'yasminesouikiii@gmail.com', first_name: 'Yasmine', last_name: 'Souiki', role: 'admin' }]);

  await page.goto('http://localhost:5173/dashboard/analytics');
  await page.waitForSelector('text=Total Handled', { timeout: 15000 });
  await page.screenshot({ path: 'D:/DXC technology internship/SLA-Monitoring-App/frontend/_pw_historical.png', fullPage: true });

  // expand a group row
  const groupRow = page.locator('.group-row').first();
  await groupRow.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'D:/DXC technology internship/SLA-Monitoring-App/frontend/_pw_group_expanded.png', fullPage: true });

  // switch to Real Time tab
  await page.locator('button:has-text("Real Time")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'D:/DXC technology internship/SLA-Monitoring-App/frontend/_pw_realtime.png', fullPage: true });

  // open Manage Queues modal
  await page.locator('button:has-text("Manage Queues")').click();
  await page.waitForSelector('text=All Queues', { timeout: 8000 });
  await page.screenshot({ path: 'D:/DXC technology internship/SLA-Monitoring-App/frontend/_pw_manage_queues.png', fullPage: true });
  await page.locator('.dash-modal-close').click();

  // open Add Interaction modal, add one, verify counters update
  await page.locator('button:has-text("Add Interaction")').click();
  await page.waitForSelector('text=Add Real-Time Interaction');
  await page.selectOption('select', { index: 1 });
  await page.locator('button:has-text("Handled")').click();
  await page.fill('input[placeholder="e.g. 12"]', '15');
  await page.fill('input[placeholder="e.g. 240"]', '200');
  await page.locator('button:has-text("Add Interaction")').last().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'D:/DXC technology internship/SLA-Monitoring-App/frontend/_pw_realtime_after_add.png', fullPage: true });

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
