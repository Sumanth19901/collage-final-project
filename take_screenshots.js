const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log("Navigating to http://localhost:3000/...");
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
        
        // Take landing page screenshot
        await page.screenshot({ path: 'screenshots/landing.png' });
        console.log("Saved landing.png");

        // Click Get Started or Login
        console.log("Looking for login button...");
        await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });
        
        console.log("Filling in credentials...");
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@demo.acia');
        await page.type('input[type="password"]', 'admin_password_2026');
        
        // Find and click the submit button
        await page.click('button[type="submit"]');

        console.log("Waiting for dashboard navigation...");
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log("Navigation timeout or already loaded"));
        
        // Wait a bit for components to render
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log("Taking dashboard screenshot...");
        await page.screenshot({ path: 'screenshots/dashboard.png' });
        console.log("Saved dashboard.png");

        // Go to roadmap maybe?
        await page.goto('http://localhost:3000/dashboard/roadmap', { waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'screenshots/roadmap.png' });
        console.log("Saved roadmap.png");

        await browser.close();
        console.log("Done.");
    } catch (e) {
        console.error("Error: ", e);
        process.exit(1);
    }
})();
