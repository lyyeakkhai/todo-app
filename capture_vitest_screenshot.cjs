const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function capture() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Running vitest --reporter=verbose...');
  let testOutput = '';
  try {
    testOutput = execSync('npx vitest run --reporter=verbose', {
      cwd: __dirname,
      encoding: 'utf8',
    });
  } catch (err) {
    testOutput = err.stdout ? err.stdout.toString() : err.message;
  }

  // Escape HTML
  const lines = testOutput.split('\n').filter((l) => !l.startsWith(' ❯ '));

  const formattedLines = lines.map((line) => {
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (escaped.includes('✓')) {
      escaped = `<span class="pass-mark">✓</span> <span class="test-text">${escaped.replace('✓', '').trim()}</span>`;
    } else if (escaped.includes('Test Files  8 passed (8)')) {
      escaped = `<span class="summary-pass-files">${escaped}</span>`;
    } else if (escaped.includes('Tests  35 passed (35)')) {
      escaped = `<span class="summary-pass-tests">${escaped}</span>`;
    } else if (escaped.includes('RUN  v5.0.1')) {
      escaped = `<span class="run-header">${escaped}</span>`;
    }

    return `<div class="term-line">${escaped}</div>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          margin: 0;
          background: #0d1117;
          font-family: ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Courier New', monospace;
          padding: 30px;
          display: flex;
          justify-content: center;
        }
        .window {
          background: #161b22;
          border-radius: 10px;
          border: 1px solid #30363d;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          width: 960px;
          overflow: hidden;
        }
        .titlebar {
          background: #21262d;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #30363d;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title {
          color: #8b949e;
          font-size: 13px;
          margin-left: 12px;
          font-weight: 500;
        }
        .content {
          padding: 24px;
          font-size: 13px;
          line-height: 1.6;
          color: #c9d1d9;
        }
        .term-line { min-height: 20px; }
        .pass-mark {
          color: #3fb950;
          font-weight: bold;
          margin-right: 6px;
        }
        .test-text { color: #f0f6fc; }
        .summary-pass-files, .summary-pass-tests {
          color: #3fb950;
          font-weight: 700;
        }
        .run-header {
          background: #238636;
          color: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="window">
        <div class="titlebar">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="title">Terminal — npx vitest run --reporter=verbose</span>
        </div>
        <div class="content">
          ${formattedLines}
        </div>
      </div>
    </body>
    </html>
  `;

  const htmlPath = path.join(__dirname, 'temp_test_report.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log('Launching browser to snapshot vitest output...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    defaultViewport: { width: 1040, height: 1200, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const outputPath = path.join(screenshotsDir, 'vitest-green-run.png');
  await page.screenshot({ path: outputPath, fullPage: true });

  await browser.close();
  fs.unlinkSync(htmlPath);

  console.log(`Saved screenshot to ${outputPath}`);
}

capture().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
