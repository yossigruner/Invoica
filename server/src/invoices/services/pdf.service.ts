import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { join } from 'path';
import { readFileSync } from 'fs';
import { PuppeteerLaunchOptions } from 'puppeteer';

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
}

@Injectable()
export class PdfService {
  private async generateHtml(invoice: any, profile: any): Promise<string> {
    // Convert the invoice data to match the InvoicePreview component's props
    const formattedData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      to: {
        name: invoice.billingName,
        address: invoice.billingAddress,
        zip: invoice.billingZip,
        city: invoice.billingCity,
        country: invoice.billingCountry,
        email: invoice.billingEmail,
        phone: invoice.billingPhone,
        province: invoice.billingProvince,
      },
      items: invoice.items.map((item: InvoiceItem) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
      currency: invoice.currency,
      paymentTerms: invoice.paymentTerms,
      additionalNotes: invoice.additionalNotes,
      adjustments: {
        discount: {
          type: invoice.discountType,
          value: invoice.discountValue
        },
        tax: {
          type: invoice.taxType,
          value: invoice.taxValue
        },
        shipping: {
          type: invoice.shippingType,
          value: invoice.shippingValue
        }
      },
      paymentMethod: invoice.paymentMethod,
    };

    const getImageSrc = (imageData: string | null | undefined): string | undefined => {
      if (!imageData) return undefined;
      try {
        if (imageData.startsWith('data:')) return imageData;
        if (imageData.startsWith('/')) {
          const baseUrl = process.env.API_URL || '';
          return `${baseUrl}${imageData}`;
        }
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
          return imageData;
        }
        return `data:image/png;base64,${imageData}`;
      } catch (error) {
        return undefined;
      }
    };

    // Create HTML template based on InvoicePreview component
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: #111827;
            }
            
            .container {
              padding: 24px;
              max-width: 210mm;
              margin: 0 auto;
              background: white;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 32px;
            }
            
            .company-info {
              flex: 1;
            }
            
            .company-logo {
              max-height: 48px;
              margin-bottom: 16px;
            }
            
            .company-details {
              color: #4B5563;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .invoice-info {
              text-align: right;
            }
            
            .invoice-number {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #111827;
            }
            
            .invoice-dates {
              color: #4B5563;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .bill-to {
              margin-bottom: 24px;
            }
            
            .bill-to-title {
              color: #4B5563;
              font-weight: 500;
              margin-bottom: 8px;
            }
            
            .bill-to-details {
              font-size: 14px;
              line-height: 1.4;
            }
            
            .bill-to-name {
              font-weight: 600;
              color: #111827;
            }
            
            .bill-to-address {
              color: #4B5563;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 24px 0;
            }
            
            th {
              text-align: left;
              padding: 8px 0;
              border-bottom: 1px solid #E5E7EB;
              color: #4B5563;
              font-weight: 500;
              font-size: 14px;
            }
            
            td {
              padding: 8px 0;
              border-bottom: 1px solid #F3F4F6;
              font-size: 14px;
            }
            
            .item-description {
              color: #6B7280;
              font-size: 12px;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .summary {
              margin-top: 24px;
              text-align: right;
              font-size: 14px;
            }
            
            .summary-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 4px;
            }
            
            .summary-label {
              color: #4B5563;
              margin-right: 16px;
            }
            
            .summary-value {
              min-width: 120px;
            }
            
            .total-row {
              border-top: 1px solid #E5E7EB;
              margin-top: 8px;
              padding-top: 8px;
              font-weight: 600;
            }
            
            .section {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #E5E7EB;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 4px;
            }
            
            .section-content {
              font-size: 14px;
              color: #4B5563;
              line-height: 1.4;
            }
            
            .signature-image {
              max-height: 48px;
              margin-top: 8px;
            }
            
            .discount {
              color: #DC2626;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Section -->
            <div class="header">
              <div class="company-info">
                ${profile.companyLogo ? `
                  <img 
                    src="${getImageSrc(profile.companyLogo)}" 
                    alt="Company Logo" 
                    class="company-logo"
                  />
                ` : ''}
                <div class="company-details">
                  <div>${profile.companyName || profile.name}</div>
                  <div>${profile.companyAddress}</div>
                  <div>${profile.companyCity}, ${profile.companyZip}</div>
                  <div>${profile.companyCountry}</div>
                </div>
              </div>
              <div class="invoice-info">
                <div class="invoice-number">Invoice #${formattedData.invoiceNumber}</div>
                <div class="invoice-dates">
                  <div>Issue date: ${new Date(formattedData.issueDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric'
                  })}</div>
                  <div>Due date: ${new Date(formattedData.dueDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric'
                  })}</div>
                </div>
              </div>
            </div>

            <!-- Bill To Section -->
            <div class="bill-to">
              <div class="bill-to-title">Bill to:</div>
              <div class="bill-to-details">
                <div class="bill-to-name">${formattedData.to.name}</div>
                <div class="bill-to-address">
                  <div>${formattedData.to.address}</div>
                  <div>
                    ${formattedData.to.city}
                    ${formattedData.to.province ? `, ${formattedData.to.province}` : ''}
                    ${formattedData.to.zip ? `, ${formattedData.to.zip}` : ''}
                    ${formattedData.to.country ? `, ${formattedData.to.country}` : ''}
                  </div>
                  <div>${formattedData.to.email}</div>
                  <div>${formattedData.to.phone}</div>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th class="text-center">QTY</th>
                  <th class="text-right">RATE</th>
                  <th class="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${formattedData.items.map((item: InvoiceItem) => `
                  <tr>
                    <td>
                      <div>${item.name}</div>
                      ${item.description ? `
                        <div class="item-description">${item.description}</div>
                      ` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${item.rate.toFixed(2)} ${formattedData.currency}</td>
                    <td class="text-right">${(item.quantity * item.rate).toFixed(2)} ${formattedData.currency}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Summary Section -->
            <div class="summary">
              <div class="summary-row">
                <div class="summary-label">Subtotal:</div>
                <div class="summary-value">${invoice.subtotal.toFixed(2)} ${formattedData.currency}</div>
              </div>
              
              ${invoice.discountValue > 0 ? `
                <div class="summary-row">
                  <div class="summary-label discount">
                    Discount ${invoice.discountType === 'percentage' ? 
                      `(${invoice.discountValue}%)` : 
                      ''}:
                  </div>
                  <div class="summary-value discount">
                    -${(invoice.discountType === 'percentage' ? 
                      (invoice.subtotal * invoice.discountValue / 100) : 
                      invoice.discountValue
                    ).toFixed(2)} ${formattedData.currency}
                  </div>
                </div>
              ` : ''}
              
              ${invoice.taxValue > 0 ? `
                <div class="summary-row">
                  <div class="summary-label">
                    Tax ${invoice.taxType === 'percentage' ? 
                      `(${invoice.taxValue}%)` : 
                      ''}:
                  </div>
                  <div class="summary-value">
                    +${(invoice.taxType === 'percentage' ? 
                      ((invoice.subtotal - (invoice.discountValue || 0)) * invoice.taxValue / 100) : 
                      invoice.taxValue
                    ).toFixed(2)} ${formattedData.currency}
                  </div>
                </div>
              ` : ''}
              
              ${invoice.shippingValue > 0 ? `
                <div class="summary-row">
                  <div class="summary-label">
                    Shipping ${invoice.shippingType === 'percentage' ? 
                      `(${invoice.shippingValue}%)` : 
                      ''}:
                  </div>
                  <div class="summary-value">
                    +${(invoice.shippingType === 'percentage' ? 
                      (invoice.subtotal * invoice.shippingValue / 100) : 
                      invoice.shippingValue
                    ).toFixed(2)} ${formattedData.currency}
                  </div>
                </div>
              ` : ''}
              
              <div class="summary-row total-row">
                <div class="summary-label">Total:</div>
                <div class="summary-value">${invoice.total.toFixed(2)} ${formattedData.currency}</div>
              </div>
            </div>

            ${formattedData.paymentTerms ? `
              <div class="section">
                <div class="section-title">Payment Terms:</div>
                <div class="section-content">${formattedData.paymentTerms}</div>
              </div>
            ` : ''}

            ${formattedData.paymentMethod === 'bank' ? `
              <div class="section">
                <div class="section-title">Payment Details:</div>
                <div class="section-content">
                  <div>Bank: ${profile.bankName}</div>
                  <div>Account name: ${profile.accountName}</div>
                  <div>Account no: ${profile.accountNumber}</div>
                </div>
              </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Contact Information:</div>
              <div class="section-content">
                <div>${profile.companyEmail || profile.email}</div>
                <div>${profile.companyPhone || profile.phone}</div>
                ${profile.companyWebsite ? `<div>${profile.companyWebsite}</div>` : ''}
              </div>
            </div>

            ${formattedData.additionalNotes ? `
              <div class="section">
                <div class="section-title">Additional Notes:</div>
                <div class="section-content">${formattedData.additionalNotes}</div>
              </div>
            ` : ''}

            ${profile.signature ? `
              <div class="section">
                <div class="section-title">Signature:</div>
                <img 
                  src="${getImageSrc(profile.signature)}" 
                  alt="Signature" 
                  class="signature-image"
                />
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  }

  async generatePdf(invoice: any, profile: any): Promise<Buffer> {
    const html = await this.generateHtml(invoice, profile);
    
    const isProduction = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;
    
    // Configure chrome to use custom args for Lambda
    const options: PuppeteerLaunchOptions = {
      args: chromium.args,
      defaultViewport: {
        width: 1200,
        height: 1800,
        deviceScaleFactor: 2,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
      env: {
        ...process.env,
        PATH: process.env.PATH + ':/tmp/chromium'
      }
    };

    if (!isProduction) {
      options.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ];
      options.executablePath = undefined;
    }
    
    const browser = await puppeteer.launch(options);
    
    try {
      const page = await browser.newPage();
      
      // Set a longer timeout and wait for network idle
      await page.setDefaultNavigationTimeout(0);
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        printBackground: true,
        preferCSSPageSize: true
      });
      
      return pdf;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
} 