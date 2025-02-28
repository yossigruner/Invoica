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
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { InvoiceErrorFilter } from './filters/invoice-error.filter';

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
  constructor(private readonly invoicesService: InvoicesService) {}

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
} 