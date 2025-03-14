import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address to send password reset instructions',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 