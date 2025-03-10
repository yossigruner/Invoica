import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileModule } from '../profile/profile.module';
import { CommunicationsModule } from '../communications/communications.module';
import { PdfService } from './services/pdf.service';
import { CloverModule } from '../clover/clover.module';

@Module({
  imports: [ProfileModule, CommunicationsModule, CloverModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService, PdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {} 