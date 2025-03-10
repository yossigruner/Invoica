import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class CloverService {
  private readonly logger = new Logger(CloverService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const clientId = this.configService.get<string>('CLOVER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLOVER_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('CLOVER_REDIRECT_URI');
    const baseUrl = this.configService.get<string>('CLOVER_API_URL');

    if (!clientId || !clientSecret || !redirectUri || !baseUrl) {
      throw new Error('Missing required Clover configuration');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.baseUrl = baseUrl;
  }

  getAuthorizationUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read write offline_access',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.baseUrl}/oauth/v2/authorize?${params.toString()}&state=${userId}&scope=com.clover.invoicing.write`;
  }

  async handleCallback(
    code: string,
    merchantId: string,
    employeeId: string,
    clientId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Verify the client_id matches
      if (clientId !== this.clientId) {
        throw new Error('Invalid client_id');
      }

      this.logger.log('Requesting token from Clover...', {
        code,
        merchantId,
        employeeId,
        clientId,
        userId,
        redirectUri: this.redirectUri,
      });

      const tokenRequest = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code'
      };

      const tokenResponse = await axios.post(`${this.baseUrl}/oauth/v2/token`, tokenRequest);
      console.log(tokenResponse);

      this.logger.log('Token response received:', {
        hasAccessToken: !!tokenResponse.data.access_token,
        hasRefreshToken: !!tokenResponse.data.refresh_token,
        expiresIn: tokenResponse.data.expires_in,
        responseData: tokenResponse.data
      });

      if (!tokenResponse.data.access_token) {
        throw new Error('Invalid token response from Clover: missing access_token');
      }

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      // If expires_in is not provided, set a default of 1 hour
      const tokenExpiry = new Date(Date.now() + ((expires_in || 3600) * 1000));

      this.logger.log('Token details:', {
        accessToken: access_token ? 'present' : 'missing',
        refreshToken: refresh_token ? 'present' : 'missing',
        expiresIn: expires_in || 'default (3600)',
        tokenExpiry: tokenExpiry.toISOString(),
      });

      // Store the integration details
      const integration = await this.prisma.cloverIntegration.upsert({
        where: { userId },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry,
        },
        create: {
          merchantId,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      this.logger.log('Integration stored:', {
        userId,
        merchantId,
        hasAccessToken: !!integration.accessToken,
        hasRefreshToken: !!integration.refreshToken,
        tokenExpiry: integration.tokenExpiry
      });

      this.logger.log(`Clover integration successful for merchant ${merchantId}`);
    } catch (error) {
      this.logger.error('Failed to handle Clover callback:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: `${this.baseUrl}/oauth/v2/token`,
          method: 'POST',
          redirectUri: this.redirectUri
        }
      });
      throw new Error(`Failed to complete Clover integration: ${error.message}`);
    }
  }

  async refreshToken(userId: string): Promise<string> {
    const integration = await this.prisma.cloverIntegration.findUnique({
      where: { userId },
    });

    if (!integration || !integration.refreshToken) {
      throw new UnauthorizedException('No valid refresh token found');
    }

    this.logger.log('Refreshing token:', {
      userId,
      hasRefreshToken: !!integration.refreshToken,
      merchantId: integration.merchantId
    });

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/v2/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: integration.refreshToken,
        grant_type: 'refresh_token',
      });

      this.logger.log('Token refresh response:', {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        expiresIn: response.data.expires_in
      });

      const { access_token, refresh_token, expires_in } = response.data;
      const tokenExpiry = new Date(Date.now() + (expires_in || 3600) * 1000);

      await this.prisma.cloverIntegration.update({
        where: { userId },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token || integration.refreshToken,
          tokenExpiry,
        },
      });

      return access_token;
    } catch (error) {
      this.logger.error('Failed to refresh Clover token:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const integration = await this.prisma.cloverIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new UnauthorizedException('No Clover integration found');
    }

    this.logger.log('Checking access token validity:', {
      userId,
      hasAccessToken: !!integration.accessToken,
      hasRefreshToken: !!integration.refreshToken,
      tokenExpiry: integration.tokenExpiry,
      currentTime: new Date(),
      isExpired: integration.tokenExpiry <= new Date()
    });

    if (!integration.accessToken) {
      throw new UnauthorizedException('No access token found');
    }

    if (integration.tokenExpiry <= new Date()) {
      this.logger.log('Access token expired, refreshing...');
      return this.refreshToken(userId);
    }

    return integration.accessToken;
  }

  async generatePaymentLink(
    userId: string, 
    currency: string,
    subtotal: number,
    taxValue: number,
    description: string,
    customerEmail?: string,
    customerName?: string,
  ): Promise<{
    paymentId: string;
    amount: number;
    status: string;
    createdAt: string;
    checkoutUrl?: string;
    expiresAt: string;
  }> {
    // First check if we have a valid integration
    const integration = await this.prisma.cloverIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new Error('No Clover integration found for this user');
    }


    const total = subtotal + (subtotal * (taxValue / 100));

    this.logger.log('Checking integration status:', {
      merchantId: integration.merchantId,
      hasAccessToken: !!integration.accessToken,
      hasRefreshToken: !!integration.refreshToken,
      tokenExpiry: integration.tokenExpiry,
      currentTime: new Date(),
      isExpired: integration.tokenExpiry <= new Date()
    });

    try {
      // Create a checkout request with the current token
      const response = await axios.post(
        `${this.baseUrl}/invoicingcheckoutservice/v1/checkouts`,
        {
          currency,
          customer: {
            email: customerEmail,
            firstName: customerName?.split(' ')[0] || '',
            lastName: customerName?.split(' ').slice(1).join(' ') || 'Nme',
          },
          shoppingCart: {
            lineItems: [
              {
                name: description || 'Payment',
                unitQty: 1,
                price: Math.round(total * 100), 
                note: description || "Payment for invoice",
              },
            ]
          }
        },
        {
          headers: {
            'X-Clover-Merchant-Id': integration.merchantId,
            'Authorization': `Bearer ${integration.accessToken}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
        },
      );

      this.logger.log('Checkout created successfully:', {
        checkoutId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        checkoutUrl: response.data.checkoutUrl
      });

      console.log(response.data);

      return {
        paymentId: response.data.checkoutSessionId,
        amount: subtotal, // Total amount including tax
        status: 'pending', // Default status since it's not in the response
        createdAt: response.data.createdTime,
        checkoutUrl: response.data.href,
        expiresAt: response.data.expirationTime
      };
    } catch (error) {
      this.logger.error('Error creating checkout:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  async disconnect(userId: string): Promise<void> {
    try {
      this.logger.log('Disconnecting Clover integration for user:', userId);
      
      // Delete the integration from the database
      await this.prisma.cloverIntegration.delete({
        where: { userId },
      });

      this.logger.log('Successfully disconnected Clover integration for user:', userId);
    } catch (error) {
      this.logger.error('Failed to disconnect Clover integration:', {
        userId,
        error: error.message,
      });
      throw new Error('Failed to disconnect Clover integration');
    }
  }
} 