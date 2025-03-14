import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [ConfigModule, PdfModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {} 