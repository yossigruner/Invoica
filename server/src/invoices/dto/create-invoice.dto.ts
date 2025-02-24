import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsIn, IsEmail, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Item description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Item quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Item rate' })
  @IsNumber()
  rate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer ID', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Issue date' })
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiProperty({ description: 'Due date', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty({ description: 'Currency' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment method', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiProperty({ description: 'Billing name' })
  @IsString()
  billingName: string;

  @ApiProperty({ description: 'Billing email' })
  @IsEmail()
  billingEmail: string;

  @ApiProperty({ description: 'Billing phone', required: false })
  @IsString()
  @IsOptional()
  billingPhone?: string;

  @ApiProperty({ description: 'Billing address', required: false })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiProperty({ description: 'Billing city', required: false })
  @IsString()
  @IsOptional()
  billingCity?: string;

  @ApiProperty({ description: 'Billing zip', required: false })
  @IsString()
  @IsOptional()
  billingZip?: string;

  @ApiProperty({ description: 'Billing country', required: false })
  @IsString()
  @IsOptional()
  billingCountry?: string;

  @ApiProperty({ description: 'Invoice status', required: false, enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({ description: 'Invoice items', type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ description: 'Discount value', required: false })
  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @ApiProperty({ description: 'Discount type (fixed or percentage)', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  discountType?: string;

  @ApiProperty({ description: 'Tax value', required: false })
  @IsNumber()
  @IsOptional()
  taxValue?: number;

  @ApiProperty({ description: 'Tax type (fixed or percentage)', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  taxType?: string;

  @ApiProperty({ description: 'Shipping value', required: false })
  @IsNumber()
  @IsOptional()
  shippingValue?: number;

  @ApiProperty({ description: 'Shipping type (fixed or percentage)', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  shippingType?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  additionalNotes?: string;
} 