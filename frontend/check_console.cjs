const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Listen to console and page errors
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[Browser ${msg.type()}] ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.error(`[Browser pageerror]`, err.message);
    });

    page.on('requestfailed', request => {
      console.log(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
    });

    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    
    await page.screenshot({ path: 'test.png', fullPage: true });
    
    console.log('HTML length:', (await page.content()).length);
    await browser.close();
  } catch (e) {
    console.error('Puppeteer Script Error:', e);
    process.exit(1);
  }
})();
