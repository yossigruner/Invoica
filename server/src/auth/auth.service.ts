import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validatePassword(email, password);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const fullUser = await this.usersService.findOne(user.id);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: fullUser.role
      }
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    
    // Always return to prevent email enumeration
    if (!user) {
      return;
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Token expires in 15 minutes

    await this.usersService.createPasswordReset({
      email,
      token,
      expiresAt,
    });

    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    await this.emailService.sendEmail(
      email,
      'Reset Your Password',
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
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
            .button {
              background-color: #7C3AED;
              color: white !important;
              padding: 12px 32px;
              border-radius: 8px;
              text-decoration: none;
              display: inline-block;
              font-weight: 500;
              font-size: 16px;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #6D28D9;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .expiry-text {
              color: #6B7280;
              font-size: 14px;
              text-align: center;
              margin: 24px 0;
            }
            .divider {
              height: 1px;
              background-color: #E5E7EB;
              margin: 32px 0;
              border: none;
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
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="logo-container">
                <div class="logo-circle"></div>
              </div>
              <div class="content-card">
                <h1>Reset your password</h1>
                <p>We received a request to reset your password. Click the button below to choose a new password.</p>
                <div class="button-container">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                <p class="expiry-text">This link will expire in 15 minutes.</p>
              </div>
              <div class="footer">
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>For security, this request was received from Invoica application.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
      `
    );

    console.log('Reset link:', resetLink);
    console.log('Token:', token);
    console.log('Expires at:', expiresAt);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException('Password must be at least 8 characters long and contain a mix of letters and numbers');
    }

    // Find and validate the reset token
    const resetRequest = await this.usersService.findPasswordReset(token);
    if (!resetRequest) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetRequest.used) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (new Date() > resetRequest.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(resetRequest.email, hashedPassword);

    // Mark the reset token as used
    await this.usersService.markPasswordResetAsUsed(token);
  }

  private isPasswordStrong(password: string): boolean {
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /[0-9]/.test(password);
  }
} 