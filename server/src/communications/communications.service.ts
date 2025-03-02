import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);
  private twilioClient: twilio.Twilio;
  
  constructor(private readonly configService: ConfigService) {
    // Initialize Twilio
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      //this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized');
    } else {
      this.logger.warn('Twilio credentials not found in environment variables');
    }
    
    // Initialize SendGrid
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey);
      this.logger.log('SendGrid client initialized');
    } else {
      this.logger.warn('SendGrid API key not found in environment variables');
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized');
      }

      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      if (!from) {
        throw new Error('Twilio phone number not configured');
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        to,
        from
      });

      this.logger.log(`SMS sent successfully to ${to}. Message SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
      if (!from) {
        throw new Error('SendGrid from email not configured');
      }

      const msg = {
        to,
        from,
        subject,
        html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}