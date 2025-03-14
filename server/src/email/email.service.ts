import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import mailgun from 'mailgun-js';
import type { Mailgun, messages } from 'mailgun-js';

@Injectable()
export class EmailService {
  private sendgrid: MailService;
  private mailgun: Mailgun;
  private emailProvider: string;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'sendgrid';
    
    // Initialize SendGrid
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      this.sendgrid = new MailService();
      this.sendgrid.setApiKey(sendgridApiKey);
    }

    // Initialize Mailgun
    const mailgunApiKey = this.configService.get<string>('MAILGUN_API_KEY');
    const mailgunDomain = this.configService.get<string>('MAILGUN_DOMAIN');
    if (mailgunApiKey && mailgunDomain) {
      this.mailgun = mailgun({
        apiKey: mailgunApiKey,
        domain: mailgunDomain
      });
    }

    // Set from email based on provider
    const fromEmail = this.emailProvider === 'sendgrid'
      ? this.configService.get<string>('SENDGRID_FROM_EMAIL')
      : this.configService.get<string>('MAILGUN_FROM_EMAIL');

    if (!fromEmail) {
      throw new Error('FROM_EMAIL not configured for the selected email provider');
    }

    this.fromEmail = fromEmail;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const emailData = {
      to,
      from: this.fromEmail,
      subject,
      html,
    };

    try {
      if (this.emailProvider === 'sendgrid') {
        await this.sendWithSendGrid(emailData);
      } else {
        await this.sendWithMailgun(emailData);
      }
      console.log(`Email sent successfully to ${to} using ${this.emailProvider}`);
    } catch (error) {
      console.error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async sendWithSendGrid(emailData: any): Promise<void> {
    if (!this.sendgrid) {
      throw new Error('SendGrid is not configured');
    }
    await this.sendgrid.send(emailData);
  }

  private async sendWithMailgun(emailData: any): Promise<void> {
    if (!this.mailgun) {
      throw new Error('Mailgun is not configured');
    }
    return new Promise((resolve, reject) => {
      this.mailgun.messages().send(emailData, (err, body) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
} 