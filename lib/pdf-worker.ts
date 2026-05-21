import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import crypto from 'crypto';

/**
 * GENERATE INVOICE PDF
 * This worker launches a headless browser, visits the secure invoice route,
 * and renders a high-quality A4 PDF buffer.
 */
export async function generateInvoicePDF(invoiceId: string) {
  let browser = null;

  try {
    const secret = process.env.INVOICE_SECRET_TOKEN || "";
    
    // 🛡️ 1. GENERATE CRYPTOGRAPHIC SIGNATURE
    // We sign the invoiceId so the template page knows this request is legitimate.
    const signature = crypto
      .createHmac("sha256", secret)
      .update(invoiceId)
      .digest("hex");

    // 🌐 2. PREPARE BROWSER
    const isProd = process.env.NODE_ENV === 'production';

    browser = await puppeteer.launch({
      args: isProd ? [...chromium.args, '--single-process', '--no-zygote', '--no-first-run'] : [],
      // This tells your PC to just use the Chrome you already have installed
      executablePath: isProd 
        ? await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar") 
        : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2,
      },
    });

    const page = await browser.newPage();
    if (!page) throw new Error("Puppeteer: Failed to create new page instance.");

    // 🕒 3. SET TIMEOUTS (Safety first)
    // 30 seconds is standard to prevent the process from hanging on Vercel/Servers
    await page.setDefaultTimeout(30000); 

    // 🔗 4. CONSTRUCT THE SECURE INTERNAL URL
    // We use localhost:3000 for internal speed and stability.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const targetUrl = `${baseUrl}/invoice/${invoiceId}?sig=${signature}`;

    // 🚀 5. NAVIGATE & RENDER
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded', // Wait until all fonts/images/styles are loaded
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial for Tailwind colors and background shades
      margin: { 
        top: '0', 
        right: '0', 
        bottom: '0', 
        left: '0' 
      },
      displayHeaderFooter: false,
    });

    return pdfBuffer;

  } catch (error: any) {
    console.error("PDF GENERATION WORKER FAILURE:", error.message);
    throw error;
  } finally {
    // 🔒 6. CLEANUP
    // Always close the browser to prevent memory leaks, even if it fails.
    if (browser !== null) {
      await browser.close();
    }
  }
}