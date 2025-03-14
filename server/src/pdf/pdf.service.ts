import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { format } from 'date-fns';

@Injectable()
export class PdfService {
  constructor(private configService: ConfigService) {}

  async generatePdf(invoice: any, profile: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = this.generatePdfHtml(invoice, profile);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
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
      await browser.close();
    }
  }

  private generatePdfHtml(invoice: any, profile: any): string {
    const items = invoice.items.map((item: any) => `
      <tr>
        <td>
          <div>${item.name}</div>
          ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${item.rate.toFixed(2)} ${invoice.currency}</td>
        <td class="text-right">${(item.quantity * item.rate).toFixed(2)} ${invoice.currency}</td>
      </tr>
    `).join('');

    const calculateTaxAmount = (subtotal: number, taxValue: number, taxType: string) => {
      if (!taxValue || taxValue === 0) return 0;
      return taxType === 'percentage' ? (subtotal * taxValue) / 100 : taxValue;
    };

    const calculateDiscountAmount = (subtotal: number, discountValue: number, discountType: string) => {
      if (!discountValue || discountValue === 0) return 0;
      return discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
    };

    const subtotal = invoice.subtotal || 0;
    const taxAmount = calculateTaxAmount(subtotal, invoice.taxValue, invoice.taxType);
    const discountAmount = calculateDiscountAmount(subtotal, invoice.discountValue, invoice.discountType);
    const shippingAmount = invoice.shippingValue || 0;

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
                    src="${profile.companyLogo}" 
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
                <div class="invoice-number">Invoice #${invoice.invoiceNumber}</div>
                <div class="invoice-dates">
                  <div>Issue date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</div>
                  <div>Due date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                </div>
              </div>
            </div>

            <!-- Bill To Section -->
            <div class="bill-to">
              <div class="bill-to-title">Bill to:</div>
              <div class="bill-to-details">
                <div class="bill-to-name">${invoice.billingName}</div>
                <div class="bill-to-address">
                  <div>${invoice.billingAddress}</div>
                  <div>
                    ${invoice.billingCity}
                    ${invoice.billingProvince ? `, ${invoice.billingProvince}` : ''}
                    ${invoice.billingZip ? `, ${invoice.billingZip}` : ''}
                    ${invoice.billingCountry ? `, ${invoice.billingCountry}` : ''}
                  </div>
                  <div>${invoice.billingEmail}</div>
                  <div>${invoice.billingPhone}</div>
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
                ${items}
              </tbody>
            </table>

            <!-- Summary Section -->
            <div class="summary">
              <div class="summary-row">
                <div class="summary-label">Subtotal:</div>
                <div class="summary-value">${invoice.subtotal.toFixed(2)} ${invoice.currency}</div>
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
                    ).toFixed(2)} ${invoice.currency}
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
                    ).toFixed(2)} ${invoice.currency}
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
                    ).toFixed(2)} ${invoice.currency}
                  </div>
                </div>
              ` : ''}
              
              <div class="summary-row total-row">
                <div class="summary-label">Total:</div>
                <div class="summary-value">${invoice.total.toFixed(2)} ${invoice.currency}</div>
              </div>
            </div>

            ${invoice.paymentTerms ? `
              <div class="section">
                <div class="section-title">Payment Terms:</div>
                <div class="section-content">${invoice.paymentTerms}</div>
              </div>
            ` : ''}

            ${invoice.paymentMethod === 'bank' ? `
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

            ${invoice.additionalNotes ? `
              <div class="section">
                <div class="section-title">Additional Notes:</div>
                <div class="section-content">${invoice.additionalNotes}</div>
              </div>
            ` : ''}

            ${profile.signature ? `
              <div class="section">
                <div class="section-title">Signature:</div>
                <img 
                  src="${profile.signature}" 
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

  getEmailTemplate(invoice: any, profile: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #7C3AED;
              color: #333;
            }
            .email-wrapper {
              padding: 40px 20px;
              background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
            }
            .email-container {
              max-width: 400px;
              margin: 0 auto;
              padding: 40px;
              background-color: white;
              border-radius: 16px;
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            .logo-container {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo-circle {
              width: 64px;
              height: 64px;
              background-color: #7C3AED;
              border-radius: 50%;
              display: inline-block;
            }
            .content-card {
              background-color: white;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
            }
            h1 {
              color: #111827;
              font-size: 24px;
              font-weight: 600;
              text-align: center;
              margin: 0 0 24px 0;
            }
            p {
              color: #6B7280;
              font-size: 16px;
              text-align: center;
              margin: 16px 0;
              line-height: 1.5;
            }
            .amount {
              font-size: 24px;
              font-weight: 600;
              color: #7C3AED;
              text-align: center;
              margin: 24px 0;
            }
            .invoice-details {
              background-color: #F9FAFB;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              color: #6B7280;
              font-size: 14px;
              background-color: #F9FAFB;
              border-radius: 12px;
              padding: 24px;
              margin-top: 24px;
            }
            .footer p {
              margin: 8px 0;
              font-size: 14px;
            }
            .pay-button {
              display: inline-block;
              background-color: #7C3AED;
              color: #FFFFFF !important;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              margin: 24px 0;
              transition: background-color 0.2s;
            }
            .pay-button:hover {
              background-color: #6D28D9;
              color: #FFFFFF !important;
            }
            .button-container {
              text-align: center;
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="logo-container">
                <div class="logo-circle"></div>
              </div>
              <div class="content-card">
                <h1>Invoice ${invoice.invoiceNumber}</h1>
                <div class="invoice-details">
                  <p>Amount Due</p>
                  <div class="amount">${invoice.currency} ${invoice.total.toFixed(2)}</div>
                </div>
                <p>Please find attached the invoice for your records.</p>
                <div class="button-container">
                  <a href="${this.configService.get('FRONTEND_URL')}/pay/${invoice.id}" class="pay-button">
                    Click Here to Pay Now
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message from Invoica.</p>
                <p>If you have any questions, please contact us.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
} 