import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Password must be at least 8 characters long and contain at least one letter and one number'
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePass123'
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
} 