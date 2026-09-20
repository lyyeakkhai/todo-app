const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function capture() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Start vite preview on port 4173
  console.log('Starting vite preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: __dirname,
    stdio: 'pipe',
  });

  // Wait for server to start
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('http://localhost:4173') || msg.includes('Local:')) {
        resolve();
      }
    });
    setTimeout(resolve, 3000);
  });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  try {
    console.log('1. Capturing NavBar Signed Out...');
    await page.goto('http://localhost:4173/store', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'navbar-signed-out.png') });

    console.log('2. Signing in as alex@example.com...');
    const signInBtn = await page.waitForSelector('.sign-in-btn');
    await signInBtn.click();
    await page.waitForSelector('.modal-container');
    const emailInput = await page.waitForSelector('#auth-email-input');
    await emailInput.type('alex@example.com');
    const submitBtn = await page.waitForSelector('.form-submit-btn');
    await submitBtn.click();
    await new Promise((r) => setTimeout(r, 700));

    console.log('Capturing NavBar Signed In (Hi, alex@example.com)...');
    await page.screenshot({ path: path.join(screenshotsDir, 'navbar-signed-in.png') });

    console.log('3. Adding item to cart with quantity 1...');
    // Click Add to Cart on the first product (Keychron Mechanical Keyboard)
    const addToCartBtn = await page.waitForSelector('.catalog-grid .product-card:nth-child(1) .add-to-cart-btn');
    await addToCartBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    console.log('Capturing Cart with quantity 1 item...');
    await page.screenshot({ path: path.join(screenshotsDir, 'cart-quantity-one.png') });

    console.log('4. Decreasing quantity from 1 to 0 (line should disappear)...');
    const decrementBtn = await page.waitForSelector('.decrement-btn');
    await decrementBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    console.log('Capturing Cart after line item disappeared at quantity 0...');
    await page.screenshot({ path: path.join(screenshotsDir, 'cart-line-disappearing-at-quantity-zero.png') });

    console.log('5. Capturing Debounce Search Box (raw vs debounced)...');
    const searchInput = await page.waitForSelector('#catalog-search');
    await searchInput.type('keychron');
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotsDir, 'debounce-search-demo.png') });

    console.log('All required screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

capture().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
