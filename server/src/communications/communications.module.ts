import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommunicationsService } from './communications.service';

@Module({
  imports: [ConfigModule],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}