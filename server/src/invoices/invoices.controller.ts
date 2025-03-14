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
  NotFoundException,
  Res,
  Req,
  Logger,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
import { InvoiceErrorFilter } from './filters/invoice-error.filter';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';
import { CommunicationsService } from '../communications/communications.service';
import { PdfService } from '../pdf/pdf.service';
import { Throttle } from '@nestjs/throttler';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { CloverService } from '../clover/clover.service';
import { IsTaxId } from 'class-validator';
import { EmailService } from '../email/email.service';

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
  private readonly logger = new Logger(InvoicesController.name);

  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
    private readonly communicationsService: CommunicationsService,
    private readonly pdfService: PdfService,
    private readonly cloverService: CloverService,
    private readonly emailService: EmailService,
  ) {}

  // Public endpoint for getting an invoice by ID without authentication
  @Get(':id/public')
  @UseGuards(RateLimitGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Get a public invoice by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findPublicOne(@Param('id') id: string, @Req() req: Record<string, any>) {
    this.logger.log(`Public invoice access attempt - IP: ${req.ip}, Invoice ID: ${id}`);
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
  async findAll(
    @Request() req: RequestWithUser,
    @Query() query: QueryInvoiceDto
  ) {
    return this.invoicesService.findAll(req.user.id, query);
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
  @UseGuards(RateLimitGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate a Clover payment link for an invoice' })
  @ApiResponse({ status: 200, description: 'Return the payment URL.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async generatePaymentLink(@Param('id') id: string, @Req() req: Record<string, any>) {
    this.logger.log(`Payment link generation attempt - IP: ${req.ip}, Invoice ID: ${id}`);
    
    try {
      const invoice = await this.invoicesService.findPublicOne(id);
      if (!invoice) {
        throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
      }

      // Generate payment using Clover service
      const payment = await this.cloverService.generatePaymentLink(
        invoice.userId,
        invoice.currency,
        invoice.subtotal,
        invoice.taxValue,
        `Payment for Invoice #${invoice.invoiceNumber}`,
        invoice.billingEmail,
        invoice.billingName
      );

      this.logger.log('Payment created successfully:', payment);

      return {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        checkoutUrl: payment.checkoutUrl
      };
    } catch (error) {
      this.logger.error('Payment link generation error:', {
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

  @Post(':id/send-email')
  @UseGuards(RateLimitGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async sendEmail(
    @Param('id') id: string,
    @Body('email') email: string,
    @Req() req: Record<string, any>
  ) {
    this.logger.log(`Email send attempt - IP: ${req.ip}, Invoice ID: ${id}, Email: ${email}`);
    const invoice = await this.invoicesService.findPublicOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const subject = `Invoice #${invoice.invoiceNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Your Invoice is Ready</h1>
        <p>Dear ${invoice.billingName},</p>
        <p>Your invoice #${invoice.invoiceNumber} has been generated.</p>
        <p><strong>Amount Due:</strong> ${invoice.currency} ${invoice.total}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <div style="margin: 20px 0;">
          <a href="${this.configService.get('FRONTEND_URL')}/pay/${id}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View and Pay Invoice
          </a>
        </div>
      </div>
    `;

    await this.communicationsService.sendEmail(email, subject, html);
    return { success: true };
  }

  @Post(':id/send-sms')
  @UseGuards(RateLimitGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async sendSMS(
    @Param('id') id: string,
    @Body('phoneNumber') phoneNumber: string,
    @Req() req: Record<string, any>
  ) {
    this.logger.log(`SMS send attempt - IP: ${req.ip}, Invoice ID: ${id}, Phone: ${phoneNumber}`);
    const invoice = await this.invoicesService.findPublicOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const message = `Your invoice #${invoice.invoiceNumber} is ready. View and pay here: ${this.configService.get('FRONTEND_URL')}/pay/${id}`;
    await this.communicationsService.sendSMS(phoneNumber, message);
    return { success: true };
  }

  @Get(':id/pdf')
  @UseGuards(RateLimitGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async downloadPdf(
    @Param('id') id: string,
    @Res() response: Response,
    @Req() req: Record<string, any>
  ) {
    this.logger.log(`PDF download attempt - IP: ${req.ip}, Invoice ID: ${id}`);
    
    const invoice = await this.invoicesService.findPublicOne(id);
    if (!invoice) {
      this.logger.warn(`PDF download failed - Invoice not found - IP: ${req.ip}, Invoice ID: ${id}`);
      throw new NotFoundException('Invoice not found');
    }

    const profile = await this.invoicesService.getProfileData(invoice.userId);
    const pdf = await this.pdfService.generatePdf(invoice, profile);

    this.logger.log(`PDF download successful - IP: ${req.ip}, Invoice ID: ${id}, Invoice Number: ${invoice.invoiceNumber}`);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber || 'download'}.pdf"`);
    response.send(pdf);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendInvoice(@Param('id') id: string, @Request() req: RequestWithUser) {
    const invoice = await this.invoicesService.findOne(req.user.id, id);
    const profile = await this.profileService.findOne(req.user.id);
    const pdfBuffer = await this.pdfService.generatePdf(invoice, profile);
    
    const subject = `Invoice ${invoice.invoiceNumber} from ${profile.companyName || req.user.email}`;
    
    await this.emailService.sendInvoiceEmail(
      invoice.billingEmail,
      subject,
      invoice,
      profile,
      pdfBuffer
    );

    // Update invoice status to sent if it was in draft
    if (invoice.status === 'DRAFT') {
      await this.invoicesService.update(req.user.id, id, { status: 'SENT' });
    }

    return { message: 'Invoice sent successfully' };
  }
} 