const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[Browser ${msg.type()}] ${msg.text()}`);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/auth/login') && response.request().method() === 'POST') {
        console.log('Login Response:', response.status(), await response.text());
      }
      if (response.url().includes('/api/bulk-orders') && response.request().method() === 'POST') {
        console.log('Bulk Order POST Response:', response.status(), await response.text());
      }
    });

    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Login
    await page.type('input[type="email"]', 'user@example.com');
    await page.type('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Logged in. Navigating to Orders...');
    
    await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle0' });
    
    // Switch to Bulk Request Tab
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Bulk / Custom Requests')) {
            await btn.click();
            break;
        }
    }
    
    // Click New Request Button
    await page.waitForTimeout(500);
    const newReqBtns = await page.$$('button');
    for (const btn of newReqBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('New Bulk Request')) {
            await btn.click();
            break;
        }
    }
    
    // Fill the form
    await page.waitForSelector('input[placeholder="Product Name (e.g. Masala 50g)"]');
    await page.type('input[placeholder="Product Name (e.g. Masala 50g)"]', 'Test Product');
    await page.type('input[placeholder="Qty"]', '50');
    
    // Fill Date (tomorrow)
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const dateStr = tmrw.toISOString().split('T')[0];
    await page.evaluate((d) => {
        document.querySelector('input[type="date"]').value = d;
    }, dateStr);
    
    // Click submit
    console.log('Submitting Form...');
    const submitBtns = await page.$$('button[type="submit"]');
    await submitBtns[0].click();
    
    await page.waitForTimeout(2000);
    
    await browser.close();
  } catch (e) {
    console.error('Puppeteer Script Error:', e);
    process.exit(1);
  }
})();
