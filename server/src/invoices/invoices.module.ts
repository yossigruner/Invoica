import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileModule } from '../profile/profile.module';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [ProfileModule, CommunicationsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
  exports: [InvoicesService],
})
export class InvoicesModule {} 