import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Customer address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Customer city', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Customer state', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Customer ZIP code', required: false })
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiProperty({ description: 'Customer country', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
} 