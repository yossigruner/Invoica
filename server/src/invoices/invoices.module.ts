import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';
import { CloverModule } from '../clover/clover.module';
import { EmailModule } from '../email/email.module';
import { ProfileModule } from '../profile/profile.module';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [
    PrismaModule, 
    PdfModule, 
    CloverModule, 
    EmailModule,
    ProfileModule,
    CommunicationsModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {} 