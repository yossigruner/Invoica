import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { MailService } from '@sendgrid/mail';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);
  private twilioClient: twilio.Twilio;
  private readonly sendGridClient: MailService;
  
  constructor(private readonly configService: ConfigService) {
    // Initialize Twilio
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = new twilio.Twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized');
    } else {
      this.logger.warn('Twilio credentials not found in environment variables');
    }
    
    // Initialize SendGrid
    this.sendGridClient = new MailService();
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      this.sendGridClient.setApiKey(sendgridApiKey);
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

      // Ensure proper E.164 format for the recipient number
      const formattedTo = to.startsWith('+') ? to : `+${to}`;

      this.logger.debug('Attempting to send SMS:', { 
        to: formattedTo,
        messageLength: message.length,
        accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID')
      });

      // First try to send using the configured phone number
      try {
        const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
        if (from) {
          const formattedFrom = from.startsWith('+') ? from : `+${from}`;
          const result = await this.twilioClient.messages.create({
            body: message,
            to: formattedTo,
            from: formattedFrom
          });
          this.logger.log(`SMS sent successfully to ${formattedTo}. Message SID: ${result.sid}`);
          return true;
        }
      } catch (phoneError) {
        this.logger.warn('Failed to send using phone number, trying messaging service...', phoneError);
      }

      // If phone number fails or is not configured, try messaging service
      try {
        const messagingServiceSid = this.configService.get<string>('TWILIO_MESSAGING_SERVICE_SID');
        if (!messagingServiceSid) {
          throw new Error('Neither phone number nor messaging service is properly configured');
        }

        const result = await this.twilioClient.messages.create({
          body: message,
          to: formattedTo,
          messagingServiceSid
        });

        this.logger.log(`SMS sent successfully using messaging service to ${formattedTo}. Message SID: ${result.sid}`);
        return true;
      } catch (messagingError) {
        throw messagingError;
      }
    } catch (error) {
      this.logger.error('Failed to send SMS:', {
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        status: error.status,
        details: error.details
      });
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

      await this.sendGridClient.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}