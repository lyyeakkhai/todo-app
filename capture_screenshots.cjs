const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function capture() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    defaultViewport: { width: 1200, height: 800, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  console.log('1. Capturing Todos initial...');
  await page.goto('http://localhost:5173/todos', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(screenshotsDir, '01-todos-initial.png') });

  console.log('2. Capturing Todos filtered to Active...');
  const activeBtn = await page.waitForSelector('button.filter-btn:nth-child(2)');
  await activeBtn.click();
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(screenshotsDir, '02-todos-filtered-active.png') });

  console.log('3. Capturing Todos filtered to Completed...');
  const completedBtn = await page.waitForSelector('button.filter-btn:nth-child(3)');
  await completedBtn.click();
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(screenshotsDir, '03-todos-filtered-completed.png') });

  console.log('4. Capturing Todos after Clear completed...');
  // Click All first
  const allBtn = await page.waitForSelector('button.filter-btn:nth-child(1)');
  await allBtn.click();
  await new Promise(r => setTimeout(r, 200));
  const clearBtn = await page.waitForSelector('button.clear-completed-btn');
  await clearBtn.click();
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(screenshotsDir, '04-todos-cleared-completed.png') });

  console.log('5. Capturing User Directory Loading Skeleton...');
  // Intercept request to delay it so we can snapshot the skeleton
  const page2 = await browser.newPage();
  await page2.setRequestInterception(true);
  page2.on('request', async (request) => {
    if (request.url().includes('jsonplaceholder.typicode.com/users')) {
      await new Promise(r => setTimeout(r, 2500));
      request.continue();
    } else {
      request.continue();
    }
  });

  const loadPromise = page2.goto('http://localhost:5173/users');
  await page2.waitForSelector('.skeleton-container');
  await page2.screenshot({ path: path.join(screenshotsDir, '05-directory-loading-skeleton.png') });
  await loadPromise;

  console.log('6. Capturing User Directory Loaded...');
  await page2.waitForSelector('.user-grid');
  await page2.screenshot({ path: path.join(screenshotsDir, '06-directory-loaded.png') });
  await page2.close();

  console.log('7. Capturing /users/:id opened directly...');
  await page.goto('http://localhost:5173/users/1', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.profile-content');
  await page.screenshot({ path: path.join(screenshotsDir, '07-user-detail-direct-url.png') });

  console.log('8. Capturing Garbage URL hitting 404...');
  await page.goto('http://localhost:5173/some-random-garbage-path-404', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.not-found-content');
  await page.screenshot({ path: path.join(screenshotsDir, '08-garbage-url-404.png') });

  await browser.close();
  console.log('All screenshots captured successfully in ./screenshots/');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
