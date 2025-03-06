import { Module } from '@nestjs/common';
import { CloverController } from './clover.controller';
import { CloverService } from './clover.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CloverController],
  providers: [CloverService],
  exports: [CloverService],
})
export class CloverModule {} 