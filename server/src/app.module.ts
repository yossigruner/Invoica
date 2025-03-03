import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CommunicationsModule } from './communications/communications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // time to live in milliseconds
      limit: 10, // number of requests allowed per TTL
    }]),
    AuthModule,
    UsersModule,
    PrismaModule,
    ProfileModule,
    InvoicesModule,
    CommunicationsModule,
  ],
})
export class AppModule {} 