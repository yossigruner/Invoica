import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { join } from 'path';
import { readFileSync } from 'fs';

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

    // Create HTML template based on InvoicePreview component
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 24px;
              background: white;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 32px;
            }
            .company-info {
              margin-bottom: 16px;
            }
            .invoice-details {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 24px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #f9fafb;
            }
            .summary {
              margin-top: 24px;
              text-align: right;
            }
            .total {
              font-weight: bold;
              font-size: 1.1em;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                ${profile.companyLogo ? `<img src="${profile.companyLogo}" alt="Company Logo" style="max-height: 48px; margin-bottom: 16px;">` : ''}
                <div>
                  <p>${profile.companyName || profile.name}</p>
                  <p>${profile.companyAddress}</p>
                  <p>${profile.companyCity}, ${profile.companyZip}</p>
                  <p>${profile.companyCountry}</p>
                </div>
              </div>
              <div class="invoice-details">
                <h2>Invoice #${formattedData.invoiceNumber}</h2>
                <p>Issue date: ${new Date(formattedData.issueDate).toLocaleDateString()}</p>
                <p>Due date: ${new Date(formattedData.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div class="bill-to">
              <h3>Bill to:</h3>
              <p><strong>${formattedData.to.name}</strong></p>
              <p>${formattedData.to.address}</p>
              <p>${formattedData.to.city}${formattedData.to.province ? `, ${formattedData.to.province}` : ''}${formattedData.to.zip ? `, ${formattedData.to.zip}` : ''}</p>
              <p>${formattedData.to.country}</p>
              <p>${formattedData.to.email}</p>
              <p>${formattedData.to.phone}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center">Quantity</th>
                  <th style="text-align: right">Rate</th>
                  <th style="text-align: right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${formattedData.items.map((item: InvoiceItem) => `
                  <tr>
                    <td>
                      <div><strong>${item.name}</strong></div>
                      ${item.description ? `<div style="color: #666">${item.description}</div>` : ''}
                    </td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: right">${item.rate.toFixed(2)} ${formattedData.currency}</td>
                    <td style="text-align: right">${(item.quantity * item.rate).toFixed(2)} ${formattedData.currency}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div>Subtotal: ${invoice.subtotal.toFixed(2)} ${formattedData.currency}</div>
              ${invoice.discountValue > 0 ? 
                `<div style="color: #dc2626">Discount: -${invoice.discountValue.toFixed(2)} ${formattedData.currency}</div>` : ''}
              ${invoice.taxValue > 0 ? 
                `<div>Tax: +${invoice.taxValue.toFixed(2)} ${formattedData.currency}</div>` : ''}
              ${invoice.shippingValue > 0 ? 
                `<div>Shipping: +${invoice.shippingValue.toFixed(2)} ${formattedData.currency}</div>` : ''}
              <div class="total">Total: ${invoice.total.toFixed(2)} ${formattedData.currency}</div>
            </div>

            ${formattedData.paymentTerms ? `
              <div style="margin-top: 24px">
                <h4>Payment Terms:</h4>
                <p>${formattedData.paymentTerms}</p>
              </div>
            ` : ''}

            ${formattedData.paymentMethod === 'bank' ? `
              <div style="margin-top: 24px">
                <h4>Payment Details:</h4>
                <p>Bank: ${profile.bankName}</p>
                <p>Account name: ${profile.accountName}</p>
                <p>Account no: ${profile.accountNumber}</p>
              </div>
            ` : ''}

            <div style="margin-top: 24px">
              <h4>Contact Information:</h4>
              <p>${profile.companyEmail || profile.email}</p>
              <p>${profile.companyPhone || profile.phone}</p>
              ${profile.companyWebsite ? `<p>${profile.companyWebsite}</p>` : ''}
            </div>

            ${formattedData.additionalNotes ? `
              <div style="margin-top: 24px">
                <h4>Additional Notes:</h4>
                <p>${formattedData.additionalNotes}</p>
              </div>
            ` : ''}

            ${profile.signature ? `
              <div style="margin-top: 24px">
                <h4>Signature:</h4>
                <img src="${profile.signature}" alt="Signature" style="max-height: 48px;">
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  }

  async generatePdf(invoice: any, profile: any): Promise<Buffer> {
    const html = await this.generateHtml(invoice, profile);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });
      
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
} 