import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyAddress?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyCity?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyZip?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyCountry?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyPhone?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  companyEmail?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyWebsite?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyRegistration?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyVat?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyLogo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accountName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  swiftCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  iban?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cloverApiKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cloverMerchantId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isProfileCompleted?: boolean;
} 