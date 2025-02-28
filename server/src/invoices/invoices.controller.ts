import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseFilters,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { InvoiceErrorFilter } from './filters/invoice-error.filter';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('invoices')
@Controller('invoices')
@UseFilters(InvoiceErrorFilter)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
  ) {}

  // Public endpoint for getting an invoice by ID without authentication
  @Get(':id/public')
  @ApiOperation({ summary: 'Get a public invoice by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findPublicOne(@Param('id') id: string) {
    return this.invoicesService.findPublicOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Request() req: RequestWithUser, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.id, createInvoiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll(@Request() req: RequestWithUser) {
    return this.invoicesService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice successfully updated.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(req.user.id, id, updateInvoiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.invoicesService.remove(req.user.id, id);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Generate a Clover payment link for an invoice' })
  @ApiResponse({ status: 200, description: 'Return the payment URL.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async generatePaymentLink(@Param('id') id: string) {
    console.log('Generating payment link for invoice:', id);
    try {
      const invoice = await this.invoicesService.findPublicOne(id);
      console.log('Found invoice:', {
        invoiceId: id,
        invoiceNumber: invoice?.invoiceNumber,
        total: invoice?.total,
        currency: invoice?.currency,
        userId: invoice?.userId
      });

      if (!invoice) {
        throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
      }

      // Get user's profile to access Clover credentials
      const profile = await this.profileService.findOne(invoice.userId);
      console.log('Found profile:', {
        userId: invoice.userId,
        hasCloverMerchantId: profile?.cloverMerchantId,
        hasCloverApiKey: profile?.cloverApiKey
      });

      if (!profile.cloverMerchantId || !profile.cloverApiKey) {
        throw new HttpException('Clover credentials not configured', HttpStatus.BAD_REQUEST);
      }

      const CLOVER_API_BASE_URL = this.configService.get<string>('CLOVER_API_BASE_URL');
      const REDIRECT_URL = this.configService.get<string>('FRONTEND_URL');
      console.log('Configuration:', {
        hasCloverApiUrl: !!CLOVER_API_BASE_URL,
        redirectUrl: REDIRECT_URL
      });

      if (!CLOVER_API_BASE_URL) {
        throw new HttpException('Clover API URL not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const checkoutData = {
        customer: {
          email: invoice.billingEmail,
          firstName: invoice.billingName.split(' ')[0],
          lastName: invoice.billingName.split(' ').slice(1).join(' '),
          phoneNumber: invoice.billingPhone || undefined
        },
        shoppingCart: {
          lineItems: [{
            name: `Invoice #${invoice.invoiceNumber}`,
            unitQty: 1,
            price: Math.round(invoice.total * 100), // Convert total to cents
            description: `Payment for Invoice #${invoice.invoiceNumber}`
          }]
        }
      };
      console.log('Checkout data:', checkoutData);
      console.log('Clover API request:', {
        url: `${CLOVER_API_BASE_URL}/invoicingcheckoutservice/v1/checkouts`,
        method: 'POST',
        headers: {
          'X-Clover-Merchant-Id': profile.cloverMerchantId,
          'Authorization': `Bearer ${profile.cloverApiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const response = await axios.post(
        `${CLOVER_API_BASE_URL}/invoicingcheckoutservice/v1/checkouts`,
        checkoutData,
        {
          headers: {
            'X-Clover-Merchant-Id': profile.cloverMerchantId,
            'Authorization': `Bearer ${profile.cloverApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Clover API response:', {
        status: response.status,
        hasUrl: !!response.data?.href,
        data: response.data
      });

      return { href: response.data.href };
    } catch (error) {
      console.error('Payment link generation error:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate payment link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook/clover')
  @ApiOperation({ summary: 'Handle Clover payment webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  async handleCloverWebhook(@Body() webhookData: any) {
    try {
      const { event, orderId } = webhookData;

      if (event === 'payment.success') {
        // Find invoice by orderId (which is our invoiceNumber)
        const invoice = await this.invoicesService.findByInvoiceNumber(orderId);
        
        if (!invoice) {
          throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
        }

        // Update invoice status to PAID
        await this.invoicesService.update(invoice.userId, invoice.id, {
          status: 'PAID'
        });

        // Log successful payment
        console.log(`Payment successful for invoice ${orderId}`);
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 