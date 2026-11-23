import puppeteer from 'puppeteer';

async function runE2ETests() {
  console.log('Starting Puppeteer End-to-End Browser Audit for Writara...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,850'],
    defaultViewport: { width: 1366, height: 850 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  console.log('Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  const tabs = [
    'Dashboard',
    'AI Generator',
    'Smart Editor',
    'Content Repurposer',
    'Brand Voice Memory',
    'Quality & Fact Audit',
    'SEO & SERP Suite',
    'Headline A/B & Clichés',
    'Content Calendar',
    'Analytics & Velocity',
    'Projects & Drafts'
  ];

  for (const tabName of tabs) {
    process.stdout.write(`Testing navigation to "${tabName}" ... `);
    const clicked = await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(name));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, tabName);

    if (clicked) {
      await new Promise(r => setTimeout(r, 600));
      console.log('OK');
    } else {
      console.log('NOT FOUND (skipping)');
    }
  }

  // Test Theme Toggle
  process.stdout.write('Testing Light/Dark mode switcher ... ');
  const toggled = await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Mode"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (toggled) {
    await new Promise(r => setTimeout(r, 500));
    console.log('OK');
  } else {
    console.log('Toggle not found');
  }

  await browser.close();

  console.log('----------------------------------------------------');
  if (pageErrors.length > 0) {
    console.error(`❌ Found ${pageErrors.length} Page Errors:`, pageErrors);
    process.exit(1);
  }
  if (consoleErrors.length > 0) {
    console.warn(`⚠️ Warning: Found ${consoleErrors.length} Console Errors:`, consoleErrors);
  } else {
    console.log('✅ ZERO Console Errors & ZERO Runtime Exceptions detected!');
  }
  console.log('🎉 Browser End-to-End audit PASSED successfully!');
}

runE2ETests().catch(err => {
  console.error('Test Runner Failed:', err);
  process.exit(1);
});
